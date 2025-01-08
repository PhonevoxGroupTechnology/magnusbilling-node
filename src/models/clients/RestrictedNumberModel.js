import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.restrictedPhonenumber');

class RestrictedNumberModel extends BaseModel {
    constructor() {
        super('restrictedPhonenumber');
    }

    async create(payload) {
        return await super.create({ ...payload, id: 0 });
    }

}

export default new RestrictedNumberModel()