import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.sip');

class SipModel extends BaseModel {
    constructor() {
        super('sip');
    }

    async create(payload) {
        return await super.create({ ...payload, id: 0, name: '' });

        //id: has to be 0, meaning we want to create a new sip acc
        //name: defaultuser updates name, but name does not update defaultuser.
    }
}

export default new SipModel()