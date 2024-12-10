import MagnusModel from '../MagnusModel.js';
import { UserSchemas } from '../../schemas/clients/UserSchema.js';
import { zodToJson } from '../../utils/utils.js';
import Logger from '../../utils/logging.js';
import { z } from 'zod';

const logger = new Logger('UserModel', false).useEnvConfig().create();

class UserModel {
    constructor() {
        this.module = 'user'
        this.schema = UserSchemas
        this.apiSchema = undefined
    }

    // singleton so you dont have to send this request every time
    getApiSchema = async () => {
        if (this.apiSchema) return this.apiSchema
        this.apiSchema = await MagnusModel.getApiSchema(this.module)
        return this.apiSchema
    }
    
    // simple method to combine api schema with some other schema needed
    combineWithApi = async (schema) => {
        let apiSchema = await this.getApiSchema()
        let combined = z.object({ ...apiSchema.shape, ...schema.shape })
        return zodToJson(combined)
    }

    async create(userData) {
        let data = {
            module: this.module,
            action: 'save',
            id: 0,
            createUser: 1,
            id_group: 3,
            active: 1,
        }
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
    }

    async find(filter) {
        let data = {
            module: this.module,
            action: 'read',
            id: id
        }
    }

    async getId(filter) {
        let data = {
            module: this.module,
            action: 'read',
        }

    }

    async getRules() {
        let apiSchema = await this.getApiSchema()
        return zodToJson(apiSchema)
    }
}

export default new UserModel()