import MagnusModelBase from '../MagnusModel.js';
import { UserSchemas } from '../../schemas/clients/UserSchema.js';
import { zodToJson } from '../../utils/utils.js';

const MagnusModel = new MagnusModelBase()

export default class UserModel {
    constructor() {
        this.module = 'user'
        this.schema = UserSchemas
        this.apiSchema = undefined
    }

    _getApiSchema = async () => {
        if (this.apiSchema) return this.apiSchema
        this.apiSchema = await MagnusModel.getApiSchema(this.module)
        return this.apiSchema
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
        console.log(`API Module Schema: ${await this._getApiSchema()}`)
        console.log(`Module Schema: ${this.schema.create}`)

        let combinedSchema =  { ...this.apiSchema, ...this.schema.create }

        return zodToJson(combinedSchema)
    }
}