import Logger from '../utils/Logger.js'

const logger = new Logger('middlewares.index').useEnvConfig().create()

import { ratelimit_auth, ratelimit_route } from './Ratelimit.js'
import { securePasswords, setLogPrefix } from './Utility.js'

export default {
    setLogPrefix,
    ratelimit_auth,
    ratelimit_route,
    securePasswords
}