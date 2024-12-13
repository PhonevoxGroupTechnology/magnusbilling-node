import Logger from '../utils/logging.js';

class BaseController {
    constructor(ControllerSchema, ControllerModel) {
        this.ControllerSchema = ControllerSchema
        this.ControllerModel = ControllerModel;
        this.logger = new Logger(`${ControllerModel.module}.controller`, false).useEnvConfig().create();
    }

    filterify(params) {
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
    async getSchema(options = { prioritize_api: false, merge_with: undefined, as_skeleton: false, block_api_param: [] }) {
        const { prioritize_api=false, merge_with=undefined, as_skeleton=false, block_api_param=[] } = options;

        let RET_SCHEMA // schema to return

        // get api schema
        let API_SCHEMA = await this.ControllerModel.getRules({
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

        return RET_SCHEMA
    }

    async getRules(req, res, next) {
        try {
            let rules =  await this.ControllerModel.getRules()

            if (rules) {
                return res.status(200).json({
                    success: true,
                    message: 'Rules retrieved successfully',
                    data: rules
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
}

export default BaseController;