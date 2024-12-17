import MagnusModel from "./MagnusModel.js";
import { logging } from '../utils/logging.js';

class MagnusBillingAPI extends Error {
    constructor(message, statusCode = 500) {
        super(message); // Define a mensagem do erro
        this.name = 'MagnusBillingAPIError'; // Define o nome do erro
        this.statusCode = statusCode; // Adiciona um status HTTP opcional
        Error.captureStackTrace(this, this.constructor); // Captura o stack trace correto
    }
}

class ModelReplier {
    /**
     * Makes a successful response
     * @param {int} code        - Status code
     * @param {string} message  - Informative message for response
     * @param {Object} data     - Additional data for response
     * @returns {Object}        - Formatted response
     */
    static success(code, message, data = {}) {
        return {
            success: true,
            message,
            code,
            ...data,
        };
    }

    /**
     * Makes an errorful response
     * @param {int} code        - Status code
     * @param {string} message  - Informative message for response
     * @param {Object} data     - Additional data for response
     * @returns {Object}        - Formatted response
     */
    static error(code, message, data = {}) {
        return {
            success: false,
            message,
            code,
            ...data,
        };
    }
}

class BaseModel {
    constructor(moduleName) {
        this.module = moduleName;
        this.logger = logging.getLogger(`api.model.${this.module}`);
    }

    /**
     * Utilitary method to create success responses
     */
    success(code, message, data = {}) {
        return ModelReplier.success(code, message, data);
    }

    /**
     * Utilitary method to create error responses.
     */
    error(code, message, data = {}) {
        return ModelReplier.error(code, message, data);
    }

    /**
     * Generic method to query the MagnusModel.
     */
    async query(payload) {
        try {
            let queryResult = await MagnusModel.query(payload);

            // generic magnus error: it always return this when something goes wrong
            if (queryResult?.response?.status == 500) {
                throw new MagnusBillingAPI('MagnusBilling API Error', 500);
            }

            // query explicitly failed
            if (queryResult?.success == false) {
                let MESSAGE = queryResult?.errors;
                return this.error(undefined, MESSAGE);
            }

            // this is really idiotic, default behaviour should be throw, but i cant do that since "success" field doesnt
            // come in every request! (list for example)
            return this.success(undefined, 'Query executed successfully', { response: queryResult });

        } catch (error) {
            return this.error(error?.code, error?.message ?? 'Query execution failed');
        }
    }

    /**
     * Obtain the validation rules for the current module.
     * 
     * @param {Object} [options]                    - Optional configs for rule returning format
     * @param {boolean} [options.as_schema=false]   - Return as z.object() (zod schema)
     * @param {boolean} [options.as_skeleton=false] - Return schema as z.any().optional(): only care about structure
     * 
     * @returns                                     - Validation rules for this module
     */
    async getRules(options = { as_schema: false, as_skeleton: false, block_param: [] }) {
        const { as_schema = false, as_skeleton = false, block_param = [] } = options;

        try {
            const rules = await MagnusModel.getRules(this.module, as_schema, as_skeleton, block_param);

            if (as_schema || as_skeleton) return rules;
            return this.success(200, 'Rules retrieved successfully', { response: {rules} });
        } catch (error) {
            return this.error(500, 'Failed to retrieve rules', { error });
        }
    }

    // methods

    /**
     * Create something on your module
     * 
     * @param {Object} userPayload          - Varies a lot. Object (JSON) necessary to create something on your module
     * @param {string} userPayload.<field>  - Field to be added to that created item
     * 
     * @returns                             - Result of operation
     */
    async create(userPayload) {
        const payload = {
            ...userPayload,
            module: this.module,
            action: 'save',
        };

        const result = await this.query(payload); // isso vai começar a retornar d maneira diferente. arrume!!!!

        // formatting create result
        if (result.success) {
            return this.success(200, undefined, { response: result.response.data ?? 'nodata' });
        }
        return this.error(500, result?.message, {});
    }

    /**
     * Update something on your module
     * 
     * @param {Object} userPayload      - Object (JSON) with the new values, AND the ID to update. The ID refers to the actual item that will be updated.
     * @param {int} userPayload.id      - ID of the item to be updated
     * @param {*} userPayload.<field>   - Field that will be updated
     * 
     * @returns                         - Result of operation
     */
    async update(userPayload) {
        const payload = {
            ...userPayload,
            module: this.module,
            action: 'save',
        };

        const result = await this.query(payload);

        // formatting update result
        if (result.success) {
            if (result.response.rows.length > 1) {
                this.logger.warn('Query updated more than 1 result. This is not supposed to happen.');
            } else {
                this.logger.info(`Expectedly updated 1 value.`)
            }

            return this.success(200, result?.msg, { response: result.response.rows[0] ?? {} });
        }
        return this.error(500, result?.message);
    }

    /**
     * Delete something on your module
     * 
     * @param {Object} userPayload   - Object (JSON) with the ID to delete
     * @param {int} userPayload.id   - ID of the item to be deleted
     * 
     * @returns                     - Result of operation
     */
    async delete(userPayload) {
        const { id } = userPayload;
        const payload = {
            id: id,
            module: this.module,
            action: 'destroy',
        };

        const result = await this.query(payload);
        if (result?.success) {
            return this.success(200, result?.msg, { response: {id: id} });
        } 
        // @FIXME
        // Either if query fails or theres no user with that id, Magnus returns a fucking code 500 for both. 
        // Meaning we have to do an ADDITIONAL QUERY just to check if the user existed in the first place. 
        // I cant assume "500 = we ok", because this could mean a fucking server error for real.
        return this.error(500, `${result?.message} NOTE: You might want to check if the user actually exists, since we return this same error for non-existing user (blame magnusbilling returns).`, {});
    }

    /**
     * List everything on your module
     * 
     * @returns - Result of operation
     */
    async list() {
        const payload = {
            module: this.module,
            action: 'read',
        };

        const result = await this.query(payload);

        if (result.success) {
            return this.success(200, 'Listed successfully', { response: result.response });
        } 
        return this.error(500, result?.message);
    }

    /**
     * This is a custom method to find a specific record by ID.
     * 
     * @param {string} filter       - All your filters, stringified the way Magnus' wants. Most likely came from a filterify()
     * 
     * @returns - Result of operation
     */
    async find(filter) {
        const payload = {
            filter,
            module: this.module,
            action: 'read',
        };

        const result = await this.query(payload);
        if (result.success) {
            return this.success(200, 'Found data', { response: result.response });
        }
        return this.error(500, result?.message);
    }

    /**
     * This is a custom method to return the ID of a specific record, by filter.
     * 
     * @param {string} filter       - All your filters, stringified the way Magnus' wants. Most likely came from a filterify()
     * 
     * @returns - Result of operation
     */
    async getId(filter) {
        const payload = {
            filter,
            module: this.module,
            action: 'read',
        };

        const result = await this.query(payload);

        if (result.success) {

            if (!result.response.rows || result.response.rows.length === 0 || !result.response.rows[0].id) {
                return this.error('ID not found', { id: null });
            }

            if (result.response.rows.length > 1) {
                let FOUND_IDS = result.response.rows.map(row => row.id);
                return this.error('Multiple IDs found', { id: FOUND_IDS });
            }

            return result.response.rows[0].id
        }
        return this.error(500, result?.message);
    }
}

export default BaseModel;