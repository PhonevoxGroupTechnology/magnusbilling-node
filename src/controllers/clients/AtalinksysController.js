import AtalinksysModel from '../../models/clients/AtalinksysModel.js'
import AtalinksysSchema from '../../schemas/clients/AtalinksysSchema.js'
import BaseController from '../BaseController.js'

class AtalinksysController extends BaseController {
    constructor() {
        super(AtalinksysSchema, AtalinksysModel);
    }
}

export default new AtalinksysController()