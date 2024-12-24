import CalleridModel from '../../models/clients/CalleridModel.js'
import CalleridSchema from '../../schemas/clients/CalleridSchema.js'
import BaseController from '../BaseController.js'

class CalleridController extends BaseController {
    constructor() {
        super(CalleridSchema, CalleridModel);
    }

    create = async (req, res, next) => {
        return super.create(req, res, next, { pre_search: true, pre_search_fields: ['id_user', 'cid'] });
    };
    
}

export default new CalleridController()
