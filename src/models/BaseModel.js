import MagnusModel from "./MagnusModel.js";
import { logging } from '../utils/logging.js';

const FUNC_SUFFIX = '';
const FUNC_POSTFIX = ' - ';

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
        const _FUNC = FUNC_SUFFIX + 'query' + FUNC_POSTFIX;
        this.logger.trace(_FUNC+`Querying MagnusBilling API with payload: ${JSON.stringify(payload)}`);
        try {
            let queryResult = await MagnusModel.query(payload);

            // generic magnus error: it always return this when something goes wrong
            if (queryResult?.response?.status == 500) {
                this.logger.error(_FUNC+`GENERAL FAILURE: ${JSON.stringify(queryResult)}`);
                throw new MagnusBillingAPI('MagnusBilling API Error', 500);
            }

            // query explicitly failed
            if (queryResult?.success == false) {
                this.logger.error(_FUNC+`EXPLICIT FAILURE: ${JSON.stringify(queryResult)}`);
                let MESSAGE = queryResult?.errors;
                return this.error(undefined, MESSAGE);
            }

            // this is really idiotic, default behaviour should be throw, but i cant do that since "success" field doesnt
            // come in every request! (list for example)
            this.logger.trace(_FUNC+`Query executed successfully`);
            return this.success(undefined, 'Query executed successfully', { response: queryResult });

        } catch (error) {
            this.logger.error(_FUNC+`Query execution failed: ${error.message}`);
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
        const _FUNC = FUNC_SUFFIX + 'getRules' + FUNC_POSTFIX;
        const { as_schema = false, as_skeleton = false, block_param = [] } = options;

        try {
            this.logger.trace(_FUNC+`Getting rules for module ${this.module} from MagnusModel`);
            const rules = await MagnusModel.getRules(this.module, as_schema, as_skeleton, block_param);

            if (as_schema || as_skeleton) {
                this.logger.trace(_FUNC+`Returning rules as ${as_schema ? 'schema' : 'skeleton'}`);
                return rules;
            }

            this.logger.trace(_FUNC+`Returning rules as JSON`);
            return this.success(200, 'Rules retrieved successfully', { response: {rules} });
        } catch (error) {
            this.logger.error(_FUNC+`Failed to retrieve rules: ${error.message}`);
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
        const _FUNC = FUNC_SUFFIX + 'create' + FUNC_POSTFIX;
        this.logger.trace(_FUNC+`Creating new record with payload ${JSON.stringify(userPayload)}`);
        const payload = {
            ...userPayload,
            module: this.module,
            action: 'save',
        };

        this.logger.trace(_FUNC+`Sending query...`);
        const result = await this.query(payload);

        this.logger.trace(_FUNC+`Analyzing result...`);
        if (result?.success) {
            
            if (result?.response?.rows && result?.response?.rows?.length > 1) {
                // NÃO FAZ SENTIDO RETORNAR MAIS DE 1 NO ROWS, ENTÃO VOU DEIXAR ACESSANDO O PRIMEIRO ITEM DO ARRAY MESMO
                // VÁ SE FUDER
                this.logger.warn(_FUNC+`UNEXPECTED: More than one row returned: ${JSON.stringify(result?.response?.rows)}`);
            }
            
            // Palhaçada esse "??" ai em. Prioriza data, depois rows, caso contrário nodata
            this.logger.debug(_FUNC+`Response: ${JSON.stringify(result?.response)}`);
            return this.success(200, undefined, { response: result?.response?.data ?? result?.response?.rows[0] ?? 'nodata' });
        }

        this.logger.error(_FUNC+`Failed: ${result}`);
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
        const _FUNC = FUNC_SUFFIX + 'update' + FUNC_POSTFIX;
        this.logger.trace(_FUNC+`Updating record with payload ${JSON.stringify(userPayload)}`);
        const payload = {
            ...userPayload,
            module: this.module,
            action: 'save',
        };

        this.logger.trace(_FUNC+`Sending query...`);
        const result = await this.query(payload);

        this.logger.trace(_FUNC+`Analyzing result...`);
        if (result.success) {
            if (result.response.rows.length > 1) {
                this.logger.warn(_FUNC+`UNEXPECTED: More than one row returned: ${JSON.stringify(result?.response?.rows)}`);
            }

            this.logger.debug(_FUNC+`Response: ${JSON.stringify(result?.response)}`);
            return this.success(200, result?.msg, { response: result.response.rows[0] ?? {} });
        }

        this.logger.error(_FUNC+`Failed: ${result}`);
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
        const _FUNC = FUNC_SUFFIX + 'delete' + FUNC_POSTFIX;
        this.logger.trace(_FUNC+`Deleting record with payload ${JSON.stringify(userPayload)}`);
        const { id } = userPayload;
        const payload = {
            id: id,
            module: this.module,
            action: 'destroy',
        };

        this.logger.trace(_FUNC+`Sending query...`);
        const result = await this.query(payload);

        this.logger.trace(_FUNC+`Analyzing result...`);
        if (result?.success) {
            this.logger.debug(`Response: ${JSON.stringify(result?.response)}`);
            return this.success(200, result?.msg, { response: {id: id} });
        } 
        // @FIXME
        // Either if query fails or theres no user with that id, Magnus returns a fucking code 500 for both. 
        // Meaning we have to do an ADDITIONAL QUERY just to check if the user existed in the first place. 
        // I cant assume "500 = we ok", because this could mean a fucking server error for real.
        // @NOTE: above issue was solved in commit 31f0f05. will delete this comment eventually

        this.logger.error(_FUNC+`Failed: ${result}`);
        return this.error(500, `${result?.message} NOTE: You might want to check if the user actually exists, since we return this same error for non-existing user (blame magnusbilling returns).`, {});
    }

    /**
     * List everything on your module
     * 
     * @returns - Result of operation
     */
    async list() {
        const _FUNC = FUNC_SUFFIX + 'list' + FUNC_POSTFIX;
        this.logger.trace(_FUNC+`Listing all records...`);
        const payload = {
            module: this.module,
            action: 'read',
        };

        this.logger.trace(_FUNC+`Sending query...`);
        const result = await this.query(payload);

        this.logger.trace(_FUNC+`Analyzing result...`);
        if (result.success) {
            this.logger.debug(_FUNC+`Response: ${JSON.stringify(result?.response)}`);
            return this.success(200, 'Listed successfully', { response: result.response });
        } 

        this.logger.error(`Failed: ${result}`);
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
        const _FUNC = FUNC_SUFFIX + 'find' + FUNC_POSTFIX;
        this.logger.trace(_FUNC+`Finding record with filter ${filter}`);
        const payload = {
            filter,
            module: this.module,
            action: 'read',
        };

        this.logger.trace(_FUNC+`Sending query...`);
        const result = await this.query(payload);

        this.logger.trace(_FUNC+`Analyzing result...`);
        if (result.success) {

            this.logger.debug(_FUNC+`Response: ${JSON.stringify(result?.response)}`);
            return this.success(200, 'Found data', { response: result.response });
        }

        this.logger.error(_FUNC+`Failed: ${result}`);
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
        const _FUNC = FUNC_SUFFIX + 'getId' + FUNC_POSTFIX;
        this.logger.trace(_FUNC+`Finding ID with filter ${filter}`);
        const payload = {
            filter,
            module: this.module,
            action: 'read',
        };

        this.logger.trace(_FUNC+`Sending query...`);
        const result = await this.query(payload);

        this.logger.trace(_FUNC+`Analyzing result...`);
        if (result.success) {

            if (!result.response.rows || result.response.rows.length === 0 || !result.response.rows[0].id) {
                this.logger.warn(_FUNC+`No ID found`);
                return this.error(404, 'ID not found', { id: null });
            }

            if (result.response.rows.length > 1) {
                let FOUND_IDS = result.response.rows.map(row => row.id);
                this.logger.warn(_FUNC+`Multiple IDs found: ${FOUND_IDS}`);
                return this.error(409, 'Multiple IDs found', { id: FOUND_IDS });
            }

            this.logger.debug(_FUNC+`ID found: ${result.response.rows[0].id}`);
            return result.response.rows[0].id
        }

        this.logger.error(_FUNC+`Failed: ${result}`);
        return this.error(500, result?.message);
    }
}

export default BaseModel;