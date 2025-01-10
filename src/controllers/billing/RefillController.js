import RefillModel from '../../models/billing/RefillModel.js'
import RefillSchema from '../../schemas/billing/RefillSchema.js'
import BaseController from '../BaseController.js'

class RefillController extends BaseController {
    constructor() {
        super(RefillSchema, RefillModel);
    }
}

export default new RefillController()