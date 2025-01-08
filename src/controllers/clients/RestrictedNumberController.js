import RestrictedNumberModel from '../../models/clients/RestrictedNumberModel.js'
import RestrictedNumberSchema from '../../schemas/clients/RestrictedNumberSchema.js'
import BaseController from '../BaseController.js'

class RestrictedNumberController extends BaseController {
    constructor() {
        super(RestrictedNumberSchema, RestrictedNumberModel);
        this.settings.useApiRules = false;
    }
}

export default new RestrictedNumberController()