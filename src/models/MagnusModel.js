import axios from 'axios';
import https from 'https';
import http from 'http';
import { createHmac } from 'crypto';
import Logger from '../utils/logging.js';

const logger = new Logger('MagnusModel', false).useEnvConfig().create();

export default class MagnusModel {
    constructor() {
        this.API_KEY = process.env.MAGNUS_API_KEY
        this.API_SECRET = process.env.MAGNUS_API_SECRET
        this.PUBLIC_URL = process.env.MAGNUS_PUBLIC_URL
    }

    teste() {
        logger.info('testando')
        return this.API_KEY
    }

    getClientes() {
        return 'teste'
    }

    _generateNonce() {
        let nonce = new Date().getTime().toString();
        nonce = nonce.slice(-10) + nonce.substr(2,6);

        logger.trace(`- Nonce: ${nonce}`)
        return nonce
    }

    _signData(data) {
        let hmac = createHmac('sha512', this.API_SECRET); // hmac512
        let content_aware_hmac = hmac.update(data); // content-aware hmac512
        let hex_ca_hmac = content_aware_hmac.digest('hex'); // hexed content-aware hmac512 (final sign)

        let sign = hex_ca_hmac
        logger.trace(`- Sign: ${sign}`)
        return sign
    }

    async getFields(data) {
        return await this.query({
            ...data,
            getFields: 1
        })
    }

    async query(data) {
        // TODO(adrian): make this support multi-id action:destroy
        // for now, no need. // 09/12/24, 16:22
        let { module, action } = data

        data.nonce = this._generateNonce()
        let post_data = new URLSearchParams(data).toString()
        let sign = this._signData(post_data)

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
            return response.data;
        } catch (error) {
            logger.error(`Error sending request to ${request_url}`)
            logger.error(error)
        }
    }
}