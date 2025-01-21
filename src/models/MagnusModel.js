import axios from 'axios';
import https from 'https';
import http from 'http';
import { createHmac } from 'crypto';
import { logging } from '../utils/logging.js'
import { format } from 'path';
import { z } from 'zod';
import { QueryError, MagnusError } from '../utils/errors.js';
// @TODO(adrian): implement those better?

/**
 * Generates a Nonce for querying Magnus
 * 
 * @returns - Nonce as string
 */
const generateNonce = () => {
    let nonce = new Date().getTime().toString();
    nonce = nonce.slice(-10) + nonce.substr(2,6);

    return nonce
}

/**
 * This is necessary to query Magnus
 * 
 * @param {string} data   - Data to sign
 * @param {string} secret - Secret to use for signing
 * 
 * @returns               - Signed data
 */
const signData = (data, secret) => {
    let hmac = createHmac('sha512', secret); // hmac512
    let content_aware_hmac = hmac.update(data); // content-aware hmac512
    let hex_ca_hmac = content_aware_hmac.digest('hex'); // hexed content-aware hmac512 (final sign)

    let sign = hex_ca_hmac
    return sign
}

/**
 * Utilitary that transforms a specific kind of formatted Object into a zod schema
 * this, precisely, expects the object returned by parseApiRules()
 * 
 * @param {Object}  obj      - Object from parseApiRules() result.
 * @param {boolean} skeleton - If true, return only the structure of the schema, not the validation rules (makes everything z.string.optional() basically )
 * 
 * @returns                  - A z.object() object (also known as zod schema)
 */
const transformToZod = (obj, skeleton = false) => {
    const schema = {};

    const defineType = (rule) => {
        let type = z.string();
        if (rule.integerOnly) type = z.number().int();
        if (rule.numerical && !rule.integerOnly) type = z.number();
        return type
    }

    const defineValidation = (field, rule) => {
        if (rule.minLength) field = field.min(rule.minLength);
        if (rule.maxLength) field = field.max(rule.maxLength);
        if (!rule.required) field = field.optional();
        return field
    }

    for (const [key, rule] of Object.entries(obj)) {
        if (skeleton) { 
            // we only want the structure
            // schema[key] = z.any().min(1).optional();
            schema[key] = z.any().refine((val) => val !== null && val !== undefined && val !== '', {
                message: 'Cannot be empty',
            }).optional();
            continue;
        }

        let field
        field = defineType(rule)
        field = defineValidation(field, rule)
        schema[key] = field;
    }
    
    return z.object(schema);
}

/**
 * Receives the rules straight from Magnus api, and formats to a more fitting format
 * this format can eventually be used into the transformToZod() function, to make a schema out of it
 * 
 * @param {*} rules - Raw array of rules obtained from "MagnusModel.getRules(<module>)"
 * 
 * @returns         - Formatted rules object, as {field: {required: true, numerical: true, maxLength: 5}} etc..
 */
const parseApiRules = (rules, blocked_parameters=[]) => {
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

    // blocking parameters before returning the parsed data
    for (const [parameter, rules] of Object.entries(fineFormat)) {
        // console.log('The parameter is: ', parameter)
        if (blocked_parameters.includes(parameter)) {
            console.log('Blocking parameter ', parameter)
            delete fineFormat[parameter]
        }
    }

    // returning
    return fineFormat
}

class MagnusModel {
    constructor() {
        this.API_KEY = process.env.MAGNUS_API_KEY
        this.API_SECRET = process.env.MAGNUS_API_SECRET
        this.PUBLIC_URL = process.env.MAGNUS_PUBLIC_URL
    }

    __getLogger(name) {
        const l = logging.getLogger(`api.model.MagnusModel.${name}`);
        return l;
    }

    /**
     * This function receives a module and returns the rules for that module
     * 
     * @param {*} module         - The module to get the rules for
     * @param {boolean} schema   - If true, returns a Zod Object
     * @param {boolean} skeleton - If true, returns a Zod Object with only the structure (everything is optional and string)
     * 
     * @returns                  - Parsed rules. May vary depending on booleans used
     */
    async getRules(module, schema=false, skeleton=false, block_param=[]) {
        const l = this.__getLogger('getRules')
        let ret;

        if (skeleton && !schema ) {
            l.warn(`${module}: Skeleton was requested, but we are not building a schema. This will be ignored.`)
        }

        // raw rule from api
        l.unit(`Getting rules for module ${module}`)
        let rules = await this.query({
            module: module,
            action: '',
            getFields: 1
        })
        l.unit(`Got rules for module ${module}:\n${JSON.stringify(rules)}`)

        if (rules) {
            ret = parseApiRules(rules, block_param) // basic parse
            if (schema) {
                ret = transformToZod(ret, skeleton) // zod object parse
            }
        }
        return ret
    }

    async query(data) {
        // @TODO(adrian): make this support multi-id action:destroy
        // for now, no need. // 09/12/24, 16:22
        const l = this.__getLogger('query')
        l.trace(`MBQuery - Sending query to MagnusBilling...`)
        l.debug(`MBQuery - Data: ${JSON.stringify(data)}`)
        let { module, action } = data

        data.nonce = generateNonce()
        let post_data = new URLSearchParams(data).toString()
        let sign = signData(post_data, this.API_SECRET)

        const headers = {
            'Key': this.API_KEY,
            'Sign': sign,
        }

        // send the request
        module = module ?? ''
        action = action ?? ''
        let request_url = `${this.PUBLIC_URL}/index.php/${module}/${action ?? ''}`
        if (!module) {
            l.warn('No module provided. Using default URL.')
            if (action) l.warn('Ignoring action')
            request_url = `${this.PUBLIC_URL}/index.php`
        }
        const protocol = request_url.startsWith('https') ? https : http
        const agent = new protocol.Agent({
            rejectUnauthorized: false,
        })
        l.unit(`Sending request to ${request_url}\nRaw post data:\n${JSON.stringify(post_data)}`)
        // l.unit(`- Headers: ${JSON.stringify(headers)}`)
        l.unit(`- Headers: #OCULTO NESTE MOMENTO POR SEGURANÇA, ESTOU GRAVANDO VIDEO TUTORIAL#`)
        l.unit(`- Body: ${post_data}`)

        let response
        try {
            response = await axios.post(request_url, post_data, {
                timeout: 5 * 1000, // 5 sec
                headers: headers,
                httpAgent: protocol === http ? agent : undefined,
                httpsAgent: protocol === https ? agent : undefined,
            })

            l.trace(`MBQuery - Response received.`)
            l.unit(`Received response from ${request_url}\n${JSON.stringify(response.data)}`)
            l.unit(`- Response: ${JSON.stringify(response.data)}`)

            if (response?.data?.success === false) {
                throw new QueryError(response.data.errors || response.data)
            }

            return response.data;
        } catch (error) {
            l.critical(`Failed to send request to ${request_url}: ${error}`)

            // axios error
            if (error instanceof axios.AxiosError) throw error

            // explicit magnus telling that your query failed to be processed
            if (error instanceof QueryError) throw error

            // general error
            throw new MagnusError(`Failed to send request to ${request_url}: ${error}`)
        }
    }
}

export default new MagnusModel()