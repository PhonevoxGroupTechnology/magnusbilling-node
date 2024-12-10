import { ZodError } from 'zod';
import Logger from '../utils/logging.js';



const logger = new Logger('ErrorHandler', false).useEnvConfig().create();

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
        logger.debug(`[VALIDATE ERROR] ${req.logprefix} Failed to validate on schema: ${JSON.stringify(error)}`);
        return res.status(400).json({error: error});
    }

    // unexpected errors
    logger.critical(`[GENERIC ERROR] ${req.logprefix} ${err.stack}`)
    return res.status(500).json({error: 'Uh oh. Something went wrong. For more information, check server logs.'});
}