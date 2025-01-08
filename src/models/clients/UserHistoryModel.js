import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.userHistory');

class UserHistoryModel extends BaseModel {
    constructor() {
        super('userHistory');
    }

    create = async (payload) => {
        return await super.create({ ...payload, id: 0 });
    }

}

export default new UserHistoryModel()