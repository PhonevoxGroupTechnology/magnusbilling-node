import axios from 'axios';
import https from 'https';
import http from 'http';
import { createHmac } from 'crypto';
import Logger from '../utils/logging.js';
import { format } from 'path';
import { z } from 'zod';

const logger = new Logger('MagnusModel', false).useEnvConfig().create();

const generateNonce = () => {
    let nonce = new Date().getTime().toString();
    nonce = nonce.slice(-10) + nonce.substr(2,6);

    logger.trace(`- Nonce: ${nonce}`)
    return nonce
}

// sign data using api secret. necessary for querying magnus
const signData = (data, secret) => {
    let hmac = createHmac('sha512', secret); // hmac512
    let content_aware_hmac = hmac.update(data); // content-aware hmac512
    let hex_ca_hmac = content_aware_hmac.digest('hex'); // hexed content-aware hmac512 (final sign)

    let sign = hex_ca_hmac
    logger.trace(`- Sign: ${sign}`)
    return sign
}

// receives the rules from getFields query, and parse in an easier-to-read way
const parseApiRules = (rules, returnAsSchema = false) => {

    // transforms an object into a zod schema. depends on some specific keywords
    const generateZodSchema = (rules) => {
        const schema = {};
    
        for (const [key, rule] of Object.entries(rules)) {
            let field = z.string(); // generic

            // Primeiro verifica se é inteiro
            if (rule.integerOnly) field = z.number().int(); 

            // Depois verifica se é um número genérico
            if (rule.numerical && !rule.integerOnly) field = z.number();

            // Adiciona validações adicionais
            if (rule.minLength) field = field.min(rule.minLength);
            if (rule.maxLength) field = field.max(rule.maxLength);
            if (!rule.required) field = field.optional();

            // Debugging para verificar o tipo
            // console.log(`Campo ${key}: ${field.constructor.name}`);
            schema[key] = field;
        }
    
        return z.object(schema);
    }

    // crude processing 
    // (this is just used as a step to get to fineFormat)
    // im lazy to straight up mash fineFormat here
    const crudeFormat = {
        expected: [],
        integer: [],
        lengths: [],
    }

    rules.forEach(item => {
        if (Array.isArray(item)) {
            if (item[1] === 'required') {
                crudeFormat.expected.push({ arguments: item[0].split(',').map(arg => arg.trim()), logic: 'AND' });
            }
        } else {
            for (const key in item) {
                if (key === 'integerOnly' && item[key]) {
                    crudeFormat.integer.push(...item[0].split(',').map(arg => arg.trim()));
                } else if (key === 'max' && item.hasOwnProperty(key)) {
                    const args = Object.entries(item)[0][1].split(',').map(arg => arg.trim());
                    crudeFormat.lengths.push({ arguments: args, max: item.max, min: item.min });
                }
            }
        }
    });

    // fine processing
    const fineFormat = {};

    // required args
    if (crudeFormat.expected && crudeFormat.expected.length > 0) {
        crudeFormat.expected.forEach(item => {
            if (item.logic === "AND") {
                item.arguments.forEach(arg => {
                    // Inicializando fineFormat[arg] somente se tiver vazio
                    if (!fineFormat[arg]) {
                        fineFormat[arg] = {}
                    }
                    fineFormat[arg].required = true;
                });
            }
        });
    }

    // integer-only args
    if (crudeFormat.integer && crudeFormat.integer.length > 0) {
        crudeFormat.integer.forEach(arg => {
            // Inicializando fineFormat[arg] somente se estiver vazio
            if (!fineFormat[arg]) {
                fineFormat[arg] = {}
            }
            fineFormat[arg].numerical = true;
            fineFormat[arg].integerOnly = true;
        });
    }

    // lengths
    if (crudeFormat.lengths && crudeFormat.lengths.length > 0) {
        crudeFormat.lengths.forEach(item => {
            item.arguments.forEach(arg => {
                // Verificando se fineFormat[arg] existe antes de atribuir
                if (!fineFormat[arg]) {
                    fineFormat[arg] = {};
                }
                // Convertendo os valores de max e min para inteiros e atribuindo a maxLength e minLength
                fineFormat[arg].maxLength = parseInt(item.max);
                if (item.min !== undefined) {
                    fineFormat[arg].minLength = parseInt(item.min);
                }
            });
        });
    }

    // returning
    if (returnAsSchema) {
        return generateZodSchema(fineFormat);
    }
    return fineFormat
}

export default class MagnusModel {
    constructor() {
        this.API_KEY = process.env.MAGNUS_API_KEY
        this.API_SECRET = process.env.MAGNUS_API_SECRET
        this.PUBLIC_URL = process.env.MAGNUS_PUBLIC_URL
    }

    async getApiSchema(module) {
        return await this.getRules(module, true)
    }

    async getRules(module, parseAsZodObject = false) {
        let rules = await this.query({
            module: module,
            action: '',
            getFields: 1
        })

        // This breaks the "MRC" format. This is not the Model's job. Oh well.
        if (rules) { rules = parseApiRules(rules, parseAsZodObject) }
        return rules
    }

    async query(data) {
        // TODO(adrian): make this support multi-id action:destroy
        // for now, no need. // 09/12/24, 16:22
        let { module, action } = data

        data.nonce = generateNonce()
        let post_data = new URLSearchParams(data).toString()
        let sign = signData(post_data, this.API_SECRET)

        const headers = {
            'Key': this.API_KEY,
            'Sign': sign,
        }

        // send the request
        const request_url = `${this.PUBLIC_URL}/index.php/${module}/${action}`
        const protocol = request_url.startsWith('https') ? https : http
        const agent = new protocol.Agent({
            rejectUnauthorized: false,
        })
        logger.info(`Sending request to ${request_url}`)
        logger.debug(`- Headers: ${JSON.stringify(headers)}`)
        logger.debug(`- Body: ${post_data}`)

        try {
            const response = await axios.post(request_url, post_data, {
                headers: headers,
                httpAgent: protocol === http ? agent : undefined,
                httpsAgent: protocol === https ? agent : undefined,
            })

            logger.info(`Received response from ${request_url}`)
            logger.trace(`- Response: ${JSON.stringify(response.data)}`)
            return response.data;
        } catch (error) {
            logger.error(`Error sending request to ${request_url}`)
            logger.error(error)
        }
    }
}