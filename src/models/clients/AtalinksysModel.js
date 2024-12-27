import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.sipuras');

class AtalinksysModel extends BaseModel {
    constructor() {
        super('sipuras');
    }

    async create(payload) {
        return await super.create({ ...payload, id: 0 });
    }

}

export default new AtalinksysModel()