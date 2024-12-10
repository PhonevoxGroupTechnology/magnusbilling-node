import User from '../../models/clients/UserModel.js'

const UserModel = new User();
const UserSchema = User.schema

export default class UserController {
    constructor() {
    }

    async create(req, res) {
        let payload = req.body
        // validate request data

        // DELETE "module" and "action" from request data. this CANNOT propagate.
        delete payload.module
        delete payload.action

        // call model to create user
        await UserModel.createUser(payload)

        // validate response
        // format response if needed

        // return
        return res.json('batata')
    }

    async get(req, res) {
        res.send('get')
    }

    async getById(req, res) {
        res.send('getById')
    }

    async update(req, res) {
        res.send('update')
    }

    async delete(req, res) {
        res.send('delete')
    }

    async getRules(req, res) {
        let rules = await UserModel.getRules()
        
        if (rules) {
            return res.json(rules)
        }
        return res.status(404).json({error: 'something happened'})
    }
}