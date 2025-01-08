import UserHistoryModel from '../../models/clients/UserHistoryModel.js'
import UserHistorySchema from '../../schemas/clients/UserHistorySchema.js'
import BaseController from '../BaseController.js'

class UserHistoryController extends BaseController {
    constructor() {
        super(UserHistorySchema, UserHistoryModel);
        this.settings.useApiRules = false; // API has no rules
    }
}

export default new UserHistoryController()