import MagnusModel from "./MagnusModel.js";
import { logging } from '../utils/logging.js';

// To generate padronized responses from Model back to Controller
class ModelReplier {
    static success(content = { data: null }) {
        return {
            success: true,
            data: content.data,
            error: null,
        };
    }

    static fail(content = { data: null, error: null }) {
        return {
            success: false,
            data: content.data,
            error: content.error,
        };
    }
}

class BaseModel {
    constructor(moduleName) {
        this.module = moduleName;
        this.logger = logging.getLogger(`api.model.${this.module}`);
    }

    /**
     * Generic method to query the MagnusModel.
     */
    async query(payload) {

        try {
            const result = await MagnusModel.query(payload);

            this.logger.trace(`BaseModel Query result: ${JSON.stringify(result)}`)

            // @TODO(adrian): this is ugly. work something out? (this works tho)
            // the problem is that on a query success, when we search someone, read magnus, it DOES NOT returns "success" for us
            // so we need to check the existance of other fields to confirm it was a successful request
            // (or, in this case, the opposite, every field needs to be missing to be considered a fail, otherwise its a success)
            if (!result.success && !result.rows && !result.count) {
                return ModelReplier.fail({
                    data: null,
                    error: result?.errors || result || "Unknown error",
                });
            }

            return ModelReplier.success({
                data: result
            });
        } catch (error) {
            throw error;
        }
    }

    async getRules(options = { as_schema: false, as_skeleton: false, block_param: [] }) {
        try {
            const rules = await MagnusModel.getRules(this.module, options.as_schema, options.as_skeleton, options.block_param);

            let retvalue = rules;
            if (options.as_schema) retvalue = rules;
            if (!(options.as_schema || options.as_skeleton)) this.logger.warn('Returning rules as plain JSON')

            return ModelReplier.success({
                data: retvalue,
            });
        } catch (error) {
            return ModelReplier.fail({
                error: `Failed to retrieve rules: ${error.message}`,
            });
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

        try {
            const result = await this.query(payload);

            this.logger.warn('Create on basemodel: ', result);

            if (result?.success) {
                return ModelReplier.success({
                    data: result.data,
                });
            } else {
                return ModelReplier.fail({
                    data: null,
                    error: result?.message || result?.error || "Create failed for unknown reasons",
                });
            }
        } catch (error) {
            return ModelReplier.fail({
                data: null,
                error: error,
            });
        }
    }


    // updated, needs testing. to test Controller.update() we need to fix getRules first
    async update(userPayload) {
        const payload = {
            ...userPayload,
            module: this.module,
            action: 'save',
        };

        try {
            const result = await this.query(payload);

            if (result?.success) {
                return ModelReplier.success({
                    data: result.data,
                });
            } else {
                return ModelReplier.fail({
                    data: null,
                    error: result?.message || "Update failed for unknown reasons",
                });
            }
        } catch (error) {
            return ModelReplier.fail({
                data: null,
                error: `Unexpected error: ${error.message}`,
            });
        }
    }

    async delete(input = { id: undefined }) {
        const payload = {
            id: input.id,
            module: this.module,
            action: 'destroy',
        };

        try {
            const result = await this.query(payload);

            if (result?.success) {
                return ModelReplier.success({
                    data: { id: input.id },
                });
            } else {
                return ModelReplier.fail({
                    data: null,
                    error: result?.message || "Deletion failed for unknown reasons",
                });
            }
        } catch (error) {
            return ModelReplier.fail({
                data: null,
                error: `Unexpected error: ${error.message}`,
            });
        }
    }

    async list() {
        return await this.find(undefined); // XD
    }

    async find(filter) {
        const payload = {
            filter,
            module: this.module,
            action: 'read',
        };

        // query should return a ModelReplier object
        // we just pass it on
        return await this.query(payload);
    }

}

export default BaseModel;