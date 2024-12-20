import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.user');

class UserModel extends BaseModel {
    constructor() {
        super('user');
    }

    async create(payload) {
        return await super.create({ ...payload, id: 0, createUser: 1 });
    }

}

export default new UserModel()