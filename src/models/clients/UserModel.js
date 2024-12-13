import Logger from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = new Logger('UserModel', false).useEnvConfig().create();

class UserModel extends BaseModel {
    constructor() {
        super('user');
    }

    async create(payload) {
        return await super.create({ ...payload, id: 0, createUser: 1 });
    }
}

export default new UserModel()