import expressRateLimit from 'express-rate-limit'
import { logging } from '../utils/logging.js';

const logger = logging.getLogger('api.middlewares.ratelimit');

const AUTH_RATELIMIT_WINDOW_MINUTES = 15
const AUTH_RATELIMIT_MAX_REQUESTS = 999
const ROUTE_RATELIMIT_WINDOW_MINUTES = 15
const ROUTE_RATELIMIT_MAX_REQUESTS = 999

export const ratelimit_auth = expressRateLimit({
    windowsMs: AUTH_RATELIMIT_WINDOW_MINUTES * 60 * 1000, // 15 min
    max: AUTH_RATELIMIT_MAX_REQUESTS, // max requests per window
    message: `Too many requests. Try again later.`,
    handler: (req, res, next) => {
        res.status(429).json({
            message: `Too many requests. Try again later.`,
        })
    }
})

export const ratelimit_route = expressRateLimit({
    windowsMs: ROUTE_RATELIMIT_WINDOW_MINUTES * 60 * 1000, // 15 min
    max: ROUTE_RATELIMIT_MAX_REQUESTS, // max requests per window
    message: `Too many requests. Try again later.`,
    handler: (req, res, next) => {
        res.status(429).json({
            message: `Too many requests. Try again later.`,
        })
    }
})

