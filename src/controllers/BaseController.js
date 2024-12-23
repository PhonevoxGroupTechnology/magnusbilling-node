import { number } from 'zod';
import { logging } from '../utils/logging.js';

const FUNC_SUFFIX = '';
const FUNC_POSTFIX = ' - ';
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
        const _FUNC = FUNC_SUFFIX+'filterify'+FUNC_POSTFIX
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
        const _FUNC = FUNC_SUFFIX+'getSchema'+FUNC_POSTFIX
        this.logger.trace(_FUNC+`Building schema. Options: ${Object.keys(options).join(', ')}`)
        const { prioritize_api=false, merge_with=undefined, as_skeleton=false, block_api_param=[] } = options;

        let RET_SCHEMA // schema to return

        // get api schema
        // @TODO(adrian): cache this shit, I dont want to request it all the time
        this.logger.trace(_FUNC+`Requesting API schema from Model...`)
        let API_SCHEMA = await this.Model.getRules({
            as_schema: true, 
            as_skeleton: as_skeleton,
            block_param: block_api_param 
        })
        
        // if we merge, how we merge
        if (merge_with) {
            this.logger.trace(_FUNC+`Merging schema...`)
            if (prioritize_api) {
                this.logger.debug(_FUNC+`Prioritizing API rules`)
                RET_SCHEMA = merge_with.merge(API_SCHEMA)
            } else {
                this.logger.debug(_FUNC+`Prioritizing Schema rules`)
                RET_SCHEMA = API_SCHEMA.merge(merge_with)
            }
        } else {
            this.logger.trace(_FUNC+`No merge.`)
            RET_SCHEMA = API_SCHEMA
        }

        this.logger.trace(_FUNC+`Returning schema`)

        return RET_SCHEMA
    }

    getRules = async (req, res, next) => {
        const _FUNC = FUNC_SUFFIX+'getRules'+FUNC_POSTFIX
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
        const _FUNC = FUNC_SUFFIX+'create'+FUNC_POSTFIX
        this.logger.info(_FUNC+`${req.logprefix}\nBody: ${JSON.stringify(req.body)}\nQuery: ${JSON.stringify(req.query)}\nParams: ${JSON.stringify(req.params)}`)
        try {
            let payload = req.body

            // validate data
            this.logger.info(`${req.logprefix} Validating schema...`)
            let schema = await this.getSchema({ merge_with: this.Schema.create() })
            payload = schema.strict().parse(payload)
            
            // create with validated data
            this.logger.info(`${req.logprefix} Creating on model...`)
            let result = await this.Model.create(payload)

            // this.logger.info(`${req.logprefix} Result result:\n${JSON.stringify(result)}`)
            this.logger.info(`${req.logprefix} Sending response...`)
            return res.status(result.code).json(result)

        } catch (error) {
            this.logger.error(`${req.logprefix} Processing failed: ${error.message}`);
            return next(error)
        }
    }

    query = async (req, res, next) => {
        const _FUNC = FUNC_SUFFIX+'query'+FUNC_POSTFIX
        this.logger.info(_FUNC+`${req.logprefix}\nBody: ${JSON.stringify(req.body)}\nQuery: ${JSON.stringify(req.query)}\nParams: ${JSON.stringify(req.params)}`)
        try {
            const handlers = {
                query: async (query) => {
                    this.logger.debug(`${req.logprefix} Validating schema...`);
                    let schema = await this.getSchema({ merge_with: this.Schema.read(), as_skeleton: true });
                    query = schema.strict().parse(query);

                    this.logger.debug(`${req.logprefix} Filter-ifying query...`);
                    return this.filterify(query);
                }
            };

            const hasQuery = Object.keys(req.query).length > 0;
            const hasParam = Object.keys(req.params).length > 0;
            let search_data, payload, result;

            if (hasQuery) {
                this.logger.debug(`${req.logprefix} Query detected`);
                search_data = req.query;
            } else if (hasParam) {
                this.logger.debug(`${req.logprefix} Params detected`);
                search_data = req.params;
            } else {
                this.logger.info(`${req.logprefix} Listing all records`);
                result = await this.Model.list();
                return res.status(result.code).json(result);
            }

            payload = await handlers.query(search_data);
            result = await this.Model.find(payload);

            this.logger.info(`${req.logprefix} Sending response...`);
            return res.status(result.code).json(result);
        } catch (error) {
            this.logger.error(`${req.logprefix} Processing failed: ${error.message}`);
            next(error);
        }
    };


    update = async (req, res, next) => {
        const _FUNC = FUNC_SUFFIX+'update'+FUNC_POSTFIX
        this.logger.info(_FUNC+`${req.logprefix}\nBody: ${JSON.stringify(req.body)}\nQuery: ${JSON.stringify(req.query)}\nParams: ${JSON.stringify(req.params)}`)
        try {
            let idToUpdate;
            let payload;
            let result;

            if (!req.params.id) {
                this.logger.debug(`${req.logprefix} No id provided`)
                idToUpdate = await this.Model.getId(this.filterify(req.params))
            } else {
                this.logger.debug(`${req.logprefix} Id provided`)
                idToUpdate = req.params.id
            }

            payload = {
                ...req.body,
                id: parseInt(idToUpdate)
            }

            this.logger.info(`${req.logprefix} Validating schema...`)
            let schema = await this.getSchema({ merge_with: this.Schema.update(), as_skeleton: true, block_api_param: ['id']})
            payload = schema.strict().parse(payload)

            this.logger.info(`${req.logprefix} Updating on model...`)
            result = await this.Model.update(payload)

            this.logger.info(`${req.logprefix} Sending response...`)
            return res.status(result.code).json(result)
        } catch (error) {
            this.logger.error(`${req.logprefix} Processing failed: ${error.message}`);
            next(error)
        }
    }

    delete = async (req, res, next) => {
        const _FUNC = FUNC_SUFFIX+'delete'+FUNC_POSTFIX
        this.logger.info(_FUNC+`${req.logprefix}\nBody: ${JSON.stringify(req.body)}\nQuery: ${JSON.stringify(req.query)}\nParams: ${JSON.stringify(req.params)}`)
        try {
            let idToDelete;
            let result;
            
            this.logger.info(`${req.logprefix} Obtaining id from model...`)
            idToDelete = await this.Model.getId(this.filterify(req.params))

            if (idToDelete?.success == false) {
                this.logger.info(`${req.logprefix} Target record does not exist`)
                return res.status(idToDelete.code).json(idToDelete)
            }

            this.logger.info(`${req.logprefix} Target record id: ${JSON.stringify(idToDelete)}: Deleting on model...`)
            result = await this.Model.delete({id: parseInt(idToDelete)})

            this.logger.info(`${req.logprefix} Sending response...`)
            return res.status(result.code).json(result)
        } catch (error) {
            this.logger.error(`${req.logprefix} Processing failed: ${error.message}`);
            next(error)
        }
    }

}

export default BaseController;