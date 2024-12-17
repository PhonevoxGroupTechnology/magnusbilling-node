import UserModel from '../../models/clients/UserModel.js'
import UserSchema from '../../schemas/clients/UserSchema.js'
import BaseController from '../BaseController.js'

class UserController extends BaseController {
    constructor() {
        super(UserSchema, UserModel);
    }
}

export default new UserController()