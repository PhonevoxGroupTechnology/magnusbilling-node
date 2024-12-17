import UserModel from '../../models/clients/UserModel.js'
import UserSchema from '../../schemas/clients/UserSchema.js'
import BaseController from '../BaseController.js'

class UserController extends BaseController {
    constructor() {
        super(UserSchema, UserModel);
    }

    // CHORE(adrian): optimize this. i hate this implementation
    _update = async (req, res, next) => {
        try {
            const handlers = {
                id: async (params, body) => {
                    // validating schema structure
                    const API_SCHEMA = await UserModel.getRules({ as_schema: true, as_skeleton: true });
                    const SCHEMA = API_SCHEMA.merge(UserSchema.read());
                    SCHEMA.strict().parse(body);
                    return {id: params.id, ...body}
                },
                username: async (params, body) => {
                    let userId = await UserModel.getId(this.filterify({ username: params.username }))
                    return handlers.id({ id: userId }, body)
                },
            };

            let payload;
            let bodyNotEmpty = Object.keys(req.body).length > 0

            // get the appropriate handler based on the request parameters
            if (req.params.id && bodyNotEmpty) {
                payload = await handlers.id(req.params, req.body);
            } else if (req.params.username && bodyNotEmpty) {
                payload = await handlers.username(req.params, req.body);
            } else {
                return res.status(400).json({ error: 'Invalid request parameters' });
            }

            let result = await UserModel.update(payload)
            return res.status(result.code).json(result)

        } catch (error) {
            next(error)
        }
    }

    delete = async (req, res, next) => {
        try {
            const handlers = {
                id: async (params) => {
                    return { id: params.id }
                },
                username: async (params) => {
                    let userId = await UserModel.getId(this.filterify({ username: params.username }))
                    return handlers.id({ id: userId })
                },
            };

            let payload;

            // get the appropriate handler based on the request parameters
            if (req.params.id) {
                payload = await handlers.id(req.params);
            } else if (req.params.username) {
                payload = await handlers.username(req.params);
            } else {
                return res.status(400).json({ error: 'Invalid request parameters' });
            }

            let ret = await UserModel.delete(payload)
            return res.json(ret)
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController()