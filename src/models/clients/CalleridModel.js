import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.callerid');

class CalleridModel extends BaseModel {
    constructor() {
        super('callerid');
    }

    async create(payload) {
        return await super.create({ ...payload, id: 0 });
        //id: has to be 0, meaning we want to create
    }

}

export default new CalleridModel()