import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.refill');

class RefillModel extends BaseModel {
    constructor() {
        super('refill');
    }

    async create(payload) {
        return await super.create({ ...payload, id: 0 });
    }

}

export default new RefillModel()