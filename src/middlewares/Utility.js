import { bcryptPassword } from '../utils/Utility.js'
import Logger from '../utils/Logger.js'

const logger = new Logger('middlewares.utility').useEnvConfig().create();

export const getClientIp = (req) => {
    const ip = req.ip.includes('::ffff:') ? req.ip.split(':')[3] : req.ip;
    return ip;
}

export const setLogPrefix = (req, res, next) => {
    req.clientIp = getClientIp(req);
    req.logPrefix = `[${req.clientIp}] [${req.method}:${req.originalUrl || req.url}]`;
    next();
}

export const securePasswords = async (req, res, next) => {
    const SALT_ROUNDS = 10;

    if (req.body.password) {
        req.body.password = await bcryptPassword(req.body.password, SALT_ROUNDS);
    }
    next();
}
