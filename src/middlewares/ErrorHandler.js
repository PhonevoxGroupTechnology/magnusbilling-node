import { ZodError } from 'zod';
import { logging } from '../utils/logging.js';

const logger = logging.getLogger('api.middlewares.errorhandler');
const validation_logger = logging.getLogger('api.validation');

const isZodError = (err) => { if (err instanceof ZodError) return true; return false; };

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

    // handling zod errors
    if (isZodError(err)) {
        let error = formatZodErrors(err);
        validation_logger.warn(`${req.logprefix} Validation error:\n${JSON.stringify(error)}`);
        return res.status(400).json({success: false, code: 400, response: {}, errors: error});
    }

    // unexpected errors
    logger.critical(`${req.logprefix} Generic error:\n${err.stack}`)
    return res.status(500).json({success: false, code: 500, response: {}, errors: 'Uh oh. Something went wrong. For more information, check server logs.'});
}