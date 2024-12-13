import MagnusModel from "./MagnusModel.js";

class ModelResponder {
    /**
     * Cria uma resposta de sucesso.
     * @param {string} message - Mensagem informativa.
     * @param {Object} data - Dados adicionais retornados na resposta.
     * @returns {Object} Resposta formatada.
     */
    static success(message, data = {}) {
        return {
            success: true,
            message,
            ...data,
        };
    }

    /**
     * Cria uma resposta de erro.
     * @param {string} message - Mensagem de erro.
     * @param {Object} data - Dados adicionais retornados na resposta.
     * @returns {Object} Resposta formatada.
     */
    static error(message, data = {}) {
        return {
            success: false,
            message,
            ...data,
        };
    }
}

class BaseModel {
    constructor(moduleName) {
        this.module = moduleName;
    }

    /**
     * Utilitary method to create success responses
     */
    success(message, data = {}) {
        return ModelResponder.success(message, data);
    }

    /**
     * Utilitary method to create error responses.
     */
    error(message, data = {}) {
        return ModelResponder.error(message, data);
    }

    /**
     * Generic method to query the MagnusModel.
     */
    async query(payload) {
        try {
            let query_result = await MagnusModel.query(payload);
            return this.success('Query executed successfully', { response: query_result });
        } catch (error) {
            return this.error('Query execution failed', { error });
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
            return this.success('Rules retrieved successfully', { rules });
        } catch (error) {
            return this.error('Failed to retrieve rules', { error });
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

        if (result.success) {
            let MESSAGE = result.msg ?? 'Created';
            let RETURNED_DATA = result.rows ?? 'nodata';
            return this.success(MESSAGE, { response: RETURNED_DATA });
        }
        return result;
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
        if (result.success) {
            let MESSAGE = result.msg ?? 'nodata';
            let RETURNED_DATA = result.rows ?? {};
            return this.success(MESSAGE, { response: RETURNED_DATA });
        }
        return result;
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
            let MESSAGE = result.msg ?? 'nodata';
            let RETURNED_DATA = { id: id }; // magnus doesnt return anything, ill return the id
            return this.success(MESSAGE, { response: RETURNED_DATA });
        }
        // @FIXME
        // Either if query fails or theres no user with that id, Magnus returns a fucking code 500 for both. 
        // Meaning we have to do an ADDITIONAL QUERY just to check if the user existed in the first place. 
        // I cant assume "500 = we ok", because this could mean a fucking server error for real.
        return result;
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
            return this.success('Listed successfully', { response: result });
        }
        return result;
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
            return this.success('Found data', { response: result });
        }
        return result;
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

        if (!result.rows || result.rows.length === 0 || !result.rows[0].id) {
            return this.error('ID not found', { id: null });
        }

        if (result.rows.length > 1) {
            return this.error('Multiple IDs found', { id: null });
        }

        return this.success('ID found', { id: result.rows[0].id });
    }
}

export default BaseModel;