import Magnus from '../MagnusModel.js';

const MagnusModel = new Magnus()
export default class UserModel {
    constructor() {
        this.module = 'user'
    }

    async create(userData) {
        let data = {
            module: this.module,
            action: 'save',
            id: id
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
        let data = {
            module: this.module,
            action: '',
            getFields: 1
        }

        let ret = await MagnusModel.query(data)
        return ret
    }
}