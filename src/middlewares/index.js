// Importing Logger
import { logging } from '../utils/logging.js';

const logger = logging.getLogger('api.middlewares.index');

// Importing middleware functions
import { handleUnexpected } from './ErrorHandler.js';
import { ratelimit_auth, ratelimit_route } from './Ratelimit.js';
import { securePasswords, setLogPrefix } from './Utility.js'; // Ajustar import conforme a solução escolhida

// Exporting all middleware functions
export default {
    handleUnexpected,
    setLogPrefix,
    ratelimit_auth,
    ratelimit_route,
    securePasswords
};
