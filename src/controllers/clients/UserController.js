import UserModel from '../../models/clients/UserModel.js'
import UserSchema from '../../schemas/clients/UserSchema.js'

const filterify = (obj) => {
    // CHORE: this should allow you to set the comparison 
    // and/or type of field manually.
    let filter = []
    for (const [key, value] of Object.entries(obj)) {
        filter.push({
            type: typeof(value),
            field: key,
            value: value,
            comparison: 'eq'
        })
    }
    return JSON.stringify(filter)
}

class UserController {
    constructor() {
    }

    async create(req, res, next) {
        try {
            let payload = req.body

            // validate request data
            // first: get the entire api schema
            let API_SCHEMA = await UserModel.getRules({ as_schema: true})
            let SCHEMA = UserSchema.create().merge(API_SCHEMA)
            SCHEMA.strict().parse(payload)

            // let rules = await MagnusModel.getRules(module, false, true)
            // let FINAL_SCHEMA = ValidatorModel.mergeSchemas(BASE_SCHEMA, API_SCHEMA)
            // await UserModel.combineApiSchema(UserSchema.create, { skeleton: true }).parse(payload)

            // ValidatorModel.transformToZod(payload, true)

            // let schema = await UserModel.combineWithApi(UserSchema.create)
    
            // DELETE "module" and "action" from request data. this CANNOT propagate.
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

    async get(req, res, next) {
        try {
            // if theres no payload, do a full get of every user
            // if there IS payload, get specifically what the payload asks for

            // get takes their payload ONLY from the query string.

            let payload = req.query
            const payloadIsEmpty = Object.keys(payload).length == 0

            if (payloadIsEmpty) {
                let userList = await UserModel.list()
                return res.json(userList)
            }

            // filtered get: get specific user
            // straight find, "like"

            // no need to parse fields, just make sure
            // user input is clean, no funny business
            delete payload.module
            delete payload.action

            // parse payload with api schema
            let schema = await UserModel.getApiSchema({
                onlyStructure: true, // dont force requireds and lengths
            })
            schema.parse(payload)

            // parse as magnus filter
            payload = filterify(payload)


            let filteredUserList = await UserModel.find(payload)

            return res.json(filteredUserList)
        } catch (error) {
            return next(error)
        }
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