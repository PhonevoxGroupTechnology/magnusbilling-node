import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.iax');

class IaxModel extends BaseModel {
    constructor() {
        super('iax');
    }

    async create(payload) {
        return await super.create({ ...payload, id: 0 });
    }

}

export default new IaxModel()