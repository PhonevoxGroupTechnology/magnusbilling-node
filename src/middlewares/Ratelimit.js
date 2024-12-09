import expressRateLimit from 'express-rate-limit'
import Logger from '../utils/Logger.js'

const logger = new Logger('middlewares.ratelimit').useEnvConfig().create()

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

