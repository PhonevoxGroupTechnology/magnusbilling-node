import MagnusModel from '../MagnusModel.js';
import { zodToJson } from '../../utils/utils.js';
import Logger from '../../utils/logging.js';
import { z } from 'zod';

const logger = new Logger('UserModel', false).useEnvConfig().create();

class UserModel {
    constructor() {
        this.module = 'user'
    }    

    /**
     * Retrieves the validation rules for the current module, optionally returning them as a Zod object and/or in a skeleton format.
     * 
     * @param {Object} [options={ as_schema: false, as_skeleton: false, block_param: [] }] - Optional configuration for retrieving the rules.
     * @param {boolean} [options.as_schema=false] - If `true`, returns the rules as a Zod object with full validation logic.
     * @param {boolean} [options.as_skeleton=false] - If `true`, returns the rules as a Zod object where all fields are optional strings, without specific validation rules like min, max, required, etc.
     * @param {Array} [options.block_param=[]] - An array of parameter names to exclude from the rules.
     * 
     * @returns {Promise<Object>} - A promise that resolves to the validation rules, either as a full Zod object or in a skeleton format, based on the options provided.
     */
    async getRules(options = { as_schema: false, as_skeleton: false, block_param: [] }) {
        const as_schema = options.as_schema || false;
        const as_skeleton = options.as_skeleton || false;
        const block_param = options.block_param || [];
        return await MagnusModel.getRules(this.module, as_schema, as_skeleton, block_param)
    }

    async create(userData) {
        let data = {
            module: this.module,
            action: 'save',
            id: 0,
            createUser: 1,
            ...userData
        }

        return await MagnusModel.query(data)
    }

    async update(id, updatedData) {
        let data = {
            module: this.module,
            action: 'save',
            id: id
        }
    }

    async delete(id) {
        let data = {
            module: this.module,
            action: 'destroy',
            id: id
        }
    }

    async list() {
        let data = {
            module: this.module,
            action: 'read',
        }
        return await MagnusModel.query(data)
    }

    async find(filter) {
        let data = {
            module: this.module,
            action: 'read',
            filter: filter
        }
        return await MagnusModel.query(data)
    }

    async getId(filter) {
        let data = {
            module: this.module,
            action: 'read',
        }

    }
}

export default new UserModel()