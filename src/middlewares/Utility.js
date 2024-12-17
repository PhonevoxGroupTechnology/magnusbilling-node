import { bcryptPassword } from '../utils/utils.js';
import { logging } from '../utils/logging.js';

const logger = logging.getLogger('api.middlewares.utility');

export const getClientIp = (req) => {
    const ip = req.ip.includes('::ffff:') ? req.ip.split(':')[3] : req.ip;
    return ip;
}

export const setLogPrefix = (req, res, next) => {
    req.clientIp = getClientIp(req);
    req.logprefix = `[${req.clientIp}] [${req.method}:${req.originalUrl || req.url}]`;
    next();
}

export const securePasswords = async (req, res, next) => {
    const SALT_ROUNDS = 10;

    if (req.body.password) {
        req.body.password = await bcryptPassword(req.body.password, SALT_ROUNDS);
    }
    next();
}

