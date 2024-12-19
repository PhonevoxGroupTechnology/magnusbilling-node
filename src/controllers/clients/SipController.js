import SipModel from '../../models/clients/SipModel.js'
import SipSchema from '../../schemas/clients/SipSchema.js'
import BaseController from '../BaseController.js'

class SipController extends BaseController {
    constructor() {
        super(SipSchema, SipModel);
    }
}

export default new SipController()