import { logging } from '../../utils/logging.js';
import BaseModel from '../BaseModel.js';

const logger = logging.getLogger('api.model.callonline');

class CallOnlineModel extends BaseModel {
    constructor() {
        super('callOnLine');
    }

    // @TODO(Adrian):
    // make this more secure. It dont really need any method from BaseModel except for like, 2 or 3

    async hangup(data) {
        const l = this.__getLogger('find');
        const payload = {
            module: this.module,
            action: 'destroy',
        };

        return await this.query(payload);
    }

    async spy(data) {
        const l = this.__getLogger('spy');
        const payload = {
            module: this.module,
            action: 'spyCall',
            ...data
        };

        return await this.query(payload);
    }

}

export default new CallOnlineModel()