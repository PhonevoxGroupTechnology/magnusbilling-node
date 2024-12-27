import IaxModel from '../../models/clients/IaxModel.js'
import IaxSchema from '../../schemas/clients/IaxSchema.js'
import BaseController from '../BaseController.js'

class IaxController extends BaseController {
    constructor() {
        super(IaxSchema, IaxModel);
    }
}

export default new IaxController()