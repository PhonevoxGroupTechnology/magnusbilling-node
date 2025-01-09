import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.callonline');

class CallOnlineModel extends BaseModel {
    constructor() {
        super('callOnLine');
    }

    // @TODO(Adrian):
    // make this more secure. It dont really need any method from BaseModel except for like, 2 or 3

    async hangup(payload) {
        const l = this.__getLogger('find');
        payload = {
            module: this.module,
            action: 'destroy',
        };

        // query should return a ModelReplier object
        // we just pass it on
        return await this.query(payload);
    }

}

export default new CallOnlineModel()