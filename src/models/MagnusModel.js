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

        logger.trace(`Nonce: ${nonce}`)
        return nonce
    }

    _signData(data) {
        let sign = createHmac('sha256', this.API_SECRET); // hmac512
        sign = sign.update(data); // content-aware hmac512
        sign = sign.digest('hex'); // hexed content-aware hmac512 (final sign)

        logger.trace(`Sign: ${sign}`)
        return sign
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
        logger.info(`Sending request to ${request_url}`)
        logger.debug(`- Headers: ${headers}`)
        logger.debug(`- Body: ${post_data}`)

        try {
            const response = await axios.post(REQUEST_URL, post_data, {
                headers: headers,
                httpAgent: {
                    rejectUnauthorized: false // ignore ssl verify
                }
            })

            logger.info(`Received response from ${request_url}`)
            return response.data;
        } catch (error) {
            logger.info(`${error.config.method}:${error.config.url} [${error.config.data}]`)
            logger.error(`Error sending request to ${request_url}`)
            logger.error(error)
            throw new Error(error).stack // bruh
        }
    }
}