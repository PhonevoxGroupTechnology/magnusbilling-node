import { logging } from '../utils/logging.js';

class BaseController {
    constructor(ControllerSchema, ControllerModel) {
        this.Schema = ControllerSchema
        this.Model = ControllerModel;
        this.logger = logging.getLogger(`api.controller.${ControllerModel.module}`);
    }

    // functions here NEEDS to be in arrow-function form
    // otherwise, they will lose the context of the class
    // func = () => {}
    // afunc = async () => {}

    filterify = (params) => {
        let filter = []
        for (const [key, value] of Object.entries(params)) {
            filter.push({
                type: typeof(value),
                field: key,
                value: value,
                comparison: 'eq'
            })
        }
        return JSON.stringify(filter)
    }

    // return the zod schema of a given controller. if prioritize_api is true, prioritize the api schema over the controller schema on merge. if as_skeleton is true, return the skeleton of the schema (everything as z.any().optional()) so we can match the fields. if block_api_param has anything inside the list, block the given parameters when doing api rule parsing
    getSchema = async (options = { prioritize_api: false, merge_with: undefined, as_skeleton: false, block_api_param: [] }) => {
        this.logger.debug(`We are going to request API's data to build the schema. Options: ${Object.keys(options).join(', ')}`)
        const { prioritize_api=false, merge_with=undefined, as_skeleton=false, block_api_param=[] } = options;

        let RET_SCHEMA // schema to return

        // get api schema
        // @TODO(adrian): cache this shit, I dont want to request it all the time
        let API_SCHEMA = await this.Model.getRules({
            as_schema: true, 
            as_skeleton: as_skeleton,
            block_param: block_api_param 
        })
        
        // if we merge, how we merge
        if (merge_with) {
            if (prioritize_api) {
                RET_SCHEMA = merge_with.merge(API_SCHEMA)
            } else {
                RET_SCHEMA = API_SCHEMA.merge(merge_with)
            }
        } else {
            RET_SCHEMA = API_SCHEMA
        }

        this.logger.debug(`We successfully built the schema.`)
        return RET_SCHEMA
    }

    getRules = async (req, res, next) => {
        try {
            let rules =  await this.Model.getRules()

            if (rules) {
                return res.status(200).json({
                    success: true,
                    message: 'Rules retrieved successfully',
                    data: rules.response
                })
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Uh oh. No rules for this module.',
                    data: null
                })
            }
        } catch (error) {
            return next(error)
        }
    }

    // ----------------------------------------------------------------------------------------------------
    // CRUD functions

    create = async (req, res, next) => {
        try {
            this.logger.info(`${req.logprefix} Received payload:\n${JSON.stringify(req.body)}`)
            let payload = req.body

            // validate data
            this.logger.info(`${req.logprefix} Validating payload...`)
            let schema = await this.getSchema({ merge_with: this.Schema.create() })
            schema.strict().parse(payload)
            
            // create with validated data
            this.logger.info(`${req.logprefix} Creating...`)
            let result = await this.Model.create(payload)

            this.logger.info(`${req.logprefix} Returning result:\n${JSON.stringify(result)}`)
            return res.status(result.code).json(result)

        } catch (error) {
            return next(error)
        }
    }

    query = async (req, res, next) => {
        try {
            const handlers = {
                query: async (query) => {
                    this.logger.info(`${req.logprefix} Validating query`)
                    let schema = await this.getSchema({merge_with: this.Schema.read(), as_skeleton: true})
                    schema.strict().parse(query)
    
                    return this.filterify(query);
                }
            }

            const isQuery = Object.keys(req.query).length > 0
            let payload;
            let result;

            if (!isQuery) {
                // not a query, list everything
                this.logger.info(`${req.logprefix} Listing...`)
                result = await this.Model.list();
                return res.status(result.code).json(result);
            }

            // it is a query: validate parameters and send foward
            payload = await handlers.query(req.query)
            result = await this.Model.find(payload);
            return res.status(result.code).json(result);
        } catch (error) {
            next(error)
            
        }
    }

}

export default BaseController;