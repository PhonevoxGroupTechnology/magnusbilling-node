import UserModel from '../../models/clients/UserModel.js'

const UserSchema = UserModel.schema

class UserController {
    constructor() {
    }

    async create(req, res, next) {
        try {
            let payload = req.body

            // validate request data
            let schema = await UserModel.combineWithApi(UserSchema.create)
            schema.parse(payload)
    
            // DELETE "module" and "action" from request data. this CANNOT propagate.
            delete payload.module
            delete payload.action
            delete payload.createUser
            delete payload.id
            
            // call model to create user
            let ret = await UserModel.create(payload)
    
            // validate response
            // format response if needed
    
            // return
            return res.json(ret)   
        } catch (error) {
            return next(error)
        }
    }

    async get(req, res) {
        // if theres no payload, do a full get of every user
        // if there IS payload, get specifically what the payload asks for

        // get takes their payload ONLY from the query string.

        let payload = req.query

        if (!payload) {
            // no payload, clean get: get all users
            let userList = await UserModel.list()
            return res.json(userList)
        }

        // filtered get: get specific user

        // parse payload
        UserModel.list()

        // straight find, "like"
        UserModel.find()

        let schema = UserSchema.read

        schema.parse(payload)
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

export default new UserController()