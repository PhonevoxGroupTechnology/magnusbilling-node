import { ZodError } from 'zod';
import { logging } from '../utils/logging.js';
import { QueryError, MagnusError } from '../utils/errors.js';
import axios from 'axios';

const logger = logging.getLogger('api.middlewares.errorhandler');
const validation_logger = logging.getLogger('api.validation');

const isZodError = (err) => { if (err instanceof ZodError) return true; return false; };
const isAxiosError = (err) => { if (err instanceof axios.AxiosError) return true; return false; };
const isMagnusError = (err) => { if (err instanceof QueryError || err instanceof MagnusError) return true; return false; };

// obrigado rafael rizzo
const formatZodErrors = (error) => {
    if (error instanceof ZodError) {
        return error.errors.map((e) => ({
            field: e.path.join('.'), // Une os caminhos do campo em uma string
            message: e.message,     // Mensagem descritiva do erro
        }));
    }
    return [{ message: "Erro desconhecido." }];
}

export const handleUnexpected = (err, req, res, next) => {

    // IF TRANSPARENT, RETURN WHAT HAPPENED CLEANLY
    if (process.env.TRANSPARENT_ERRORS === 'true') {
        logger.critical(`${req.logprefix} Unexpected error:\n${err.stack}`)
        return res.status(500).json({ success: false, data: null, error: { message: err.message, details: err.stack } });
    }

    // handling zod errors
    if (isZodError(err)) {
        validation_logger.debug(`${req.logprefix} Validation Error:`, err.issues);
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                message: 'Failed to validate request data.',
                details: formatZodErrors(err) || 'No additional details available.',
            }
        });
    }

    // request errors (like timeouts etc)
    if (isAxiosError(err)) {
        logger.debug(`${req.logprefix} Request Error (AXIOS):`, err.message);
        return res.status(err.response?.status || 500).json({
            success: false,
            data: null,
            error: {
                message: `Request Error: ${err.message}`,
                details: err.response?.data || 'No additional details available.',
            },
        });
    }

    if (isMagnusError(err)) {
        logger.debug(`${req.logprefix} ${err.name}:`, err.message);
        // se for QueryError, o status é 400, se não, o status é 500

        return res.status(err.status || (err instanceof QueryError) ? 400 : 500).json({
            success: false,
            data: null,
            error: {
                message: err.message,
                details: err.details || 'No additional details available.',
            },
        });
    }

    // unexpected errors
    logger.critical(`${req.logprefix} Generic error:`, err.stack || err)
    return res.status(500).json({ success: false, data: null, error: 'Uh oh. Something went wrong. For more information, check server logs.' });
}