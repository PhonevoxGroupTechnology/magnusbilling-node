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

            // Validate user data
            let API_SCHEMA = await UserModel.getRules({ as_schema: true})
            let SCHEMA = UserSchema.create().merge(API_SCHEMA)
            SCHEMA.strict().parse(payload)
            
            // Create user with validated data
            let ret = await UserModel.create(payload)
    
            // Validate response
            // not necessary in this case
    
            // Return the result
            return res.json(ret)   
        } catch (error) {
            return next(error)
        }
    }

    async get(req, res, next) {
        try {
            // INFO(adrian):
            // this only really works for single-parameter routes.
            // since we wont really be having multi-parameter routes, i dont mind
            // be mindful about this anyways.
            const handlers = {
                id: async (params) => filterify({ id: params.id }),
                username: async (params) => filterify({ username: params.username }),
                query: async (params) => {
                    // validating schema structure
                    const API_SCHEMA = await UserModel.getRules({ as_schema: true, as_skeleton: true });
                    const SCHEMA = UserSchema.read().merge(API_SCHEMA);
                    SCHEMA.strict().parse(params.query);
    
                    return filterify(params.query);
                },
            };
    
            let payload;
    
            // get the appropriate handler based on the request parameters
            if (req.params.id) {
                payload = handlers.id(req.params);
            } else if (req.params.username) {
                payload = handlers.username(req.params);
            } else if (Object.keys(req.query).length > 0) {
                payload = handlers.query({ query: req.query });
            } else {
                // no payload, return everything
                const userList = await UserModel.list();
                return res.json(userList);
            }
    
            // find the user
            const filteredUserList = await UserModel.find(payload);
            return res.json(filteredUserList);
        } catch (error) {
            return next(error)
        }
    }

    // CHORE(adrian): optimize this. i hate this implementation
    async update(req, res, next) {
        try {
            const handlers = {
                id: async (params, body) => {
                    // validating schema structure
                    console.log('Updating id user: ', params.id)
                    const API_SCHEMA = await UserModel.getRules({ as_schema: true, as_skeleton: true });
                    const SCHEMA = UserSchema.read().merge(API_SCHEMA);
                    SCHEMA.strict().parse(body);
                    return {id: params.id, ...body}
                },
                username: async (params, body) => {
                    let result = await UserModel.find(filterify({ username: params.username }))
                    let userId = result.rows[0].id // this can fail. i will NOT validate the result. fuck you
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

            return res.json(await UserModel.update(payload))

        } catch (error) {
            next(error)
        }
    }

    async delete(req, res, next) {
        res.send('delete')
    }

    async getRules(req, res, next) {
        let rules = await UserModel.getRules()
        
        if (rules) {
            return res.json(rules)
        }
        return res.status(404).json({error: 'something happened'})
    }
}

export default new UserController()