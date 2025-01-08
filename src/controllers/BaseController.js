import { number } from 'zod';
import { logging } from '../utils/logging.js';
import { zodToJson } from '../utils/utils.js';
import { z } from "zod";

class BaseController {
    constructor(ControllerSchema, ControllerModel) {
        this.Schema = ControllerSchema
        this.Model = ControllerModel;
        this.logger = logging.getLogger(`api.controller.${ControllerModel.module}`);

        this.settings = {
            "useApiRules": true, //  whether to use the api rules or not
        }

        this._bindMethods();
    }

    // this is horrendous.
    _bindMethods() {
        const prototype = Object.getPrototypeOf(this);
        const basePrototype = BaseController.prototype; // Garante o protótipo correto

        Object.getOwnPropertyNames(basePrototype).forEach((methodName) => {
            // console.log(`BaseController Method: ${methodName}`);
            if (
                typeof basePrototype[methodName] === 'function' &&
                methodName !== 'constructor'
            ) {
                // console.log(`Binding BaseController method: ${methodName}`);
                this[methodName] = basePrototype[methodName].bind(this);
            }
        });
    }

    __getLogger(name) {
        const l = logging.getLogger(`api.controller.${this.Model.module}.${name}`);
        return l;
    }

    filterify(params) {
        const l = this.__getLogger('filterify');
        let filter = []
        for (const [key, value] of Object.entries(params)) {
            filter.push({
                type: typeof (value),
                field: key,
                value: value,
                comparison: 'eq'
            })
        }
        return JSON.stringify(filter)
    }

    // return the zod schema of a given controller. if prioritize_api is true, prioritize the api schema over the controller schema on merge. if as_skeleton is true, return the skeleton of the schema (everything as z.any().optional()) so we can match the fields. if block_api_param has anything inside the list, block the given parameters when doing api rule parsing
    async getSchema(options = { prioritize_api: false, merge_with: undefined, as_skeleton: false, block_api_param: [] }) {
        const l = this.__getLogger('getSchema');
        l.trace(`Building schema. Options: ${Object.keys(options).join(', ')}`)
        const { prioritize_api = false, merge_with = undefined, as_skeleton = false, block_api_param = [] } = options;

        let RET_SCHEMA; // schema to return

        // Verificar se as regras da API devem ser usadas
        if (this.settings?.useApiRules !== false) {
            // get api schema
            // @TODO(adrian): cache this shit, I dont want to request it all the time
            l.trace(`Requesting API schema from Model...`);
            let api_rules_result = await this.Model.getRules({
                as_schema: true,
                as_skeleton: as_skeleton,
                block_param: block_api_param
            });

            if (!api_rules_result.success) throw new Error(`Failed to get API rules:`, api_rules_result);
            let API_SCHEMA = api_rules_result.data;

            // Se `merge_with` for fornecido, mesclar os esquemas
            if (merge_with) {
                l.trace(`Merging schema...`);
                if (prioritize_api) {
                    l.debug(`Prioritizing API rules`);
                    RET_SCHEMA = merge_with.merge(API_SCHEMA);
                } else {
                    l.debug(`Prioritizing Schema rules`);
                    RET_SCHEMA = API_SCHEMA.merge(merge_with);
                }
            } else {
                l.trace(`No merge.`);
                RET_SCHEMA = API_SCHEMA;
            }
        } else {
            l.debug(`API rules are disabled by settings.`);
            // Caso as regras da API estejam desativadas, retornar apenas `merge_with` ou um schema vazio
            if (merge_with) {
                RET_SCHEMA = merge_with;
            } else {
                RET_SCHEMA = as_skeleton ? z.object({}).passthrough() : undefined;
            }
        }

        l.trace(`Returning schema`);
        return RET_SCHEMA;











        // // get api schema
        // // @TODO(adrian): cache this shit, I dont want to request it all the time
        // l.trace(`Requesting API schema from Model...`)
        // let api_rules_result = await this.Model.getRules({
        //     as_schema: true,
        //     as_skeleton: as_skeleton,
        //     block_param: block_api_param
        // })

        // if (!api_rules_result.success) throw new Error(`Failed to get API rules:`, api_rules_result)
        // let API_SCHEMA = api_rules_result.data

        // // if we merge, how we merge
        // if (merge_with) {
        //     l.trace(`Merging schema...`)
        //     if (prioritize_api) {
        //         l.debug(`Prioritizing API rules`)
        //         RET_SCHEMA = merge_with.merge(API_SCHEMA)
        //     } else {
        //         l.debug(`Prioritizing Schema rules`)
        //         RET_SCHEMA = API_SCHEMA.merge(merge_with)
        //     }
        // } else {
        //     l.trace(`No merge.`)
        //     RET_SCHEMA = API_SCHEMA
        // }

        // l.trace(`Returning schema`)

        // return RET_SCHEMA
    }

    async getRules(req, res, next) {
        try {
            const l = this.__getLogger('getRules');
            let result = await this.Model.getRules()

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Rules retrieved successfully',
                    data: result.data
                })
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Uh oh. No rules for this module?',
                    data: null
                })
            }
        } catch (error) {
            return next(error);
        }
    }

    // ----------------------------------------------------------------------------------------------------
    // CRUD functions

    async create(req, res, next, options = { pre_search: false, pre_search_fields: undefined }) {
        try {
            const l = this.__getLogger('create');
            let payload, validated_payload, create_schema, result

            // validating
            l.info(`${req.logprefix} Validating payload...`)
            payload = req.body
            create_schema = await this.getSchema({ merge_with: this.Schema.create() })
            validated_payload = create_schema.strict().parse(payload)

            // we gotta do a pre-search if this record already exists before proceeding
            // this is only needed in some specific endpoints like callerid 
            // that we manually have to check if something already exists before creating a new one
            l.info(`${req.logprefix} Testing for presearch`)
            if (options.pre_search) {
                let pre_search_payload = validated_payload
                l.info(`${req.logprefix} Pre-searching for existing data...`)

                // check if we only presearch on specific fields, or we presearch everything
                if (options.pre_search_fields) {
                    l.info(`${req.logprefix} Pre-search has specified fields`, options.pre_search_fields)
                    pre_search_payload = {}
                    for (const field of options.pre_search_fields) {
                        pre_search_payload[field] = validated_payload[field]
                    }
                }

                let pre_search_id = await this.getId(pre_search_payload)

                if (pre_search_id?.length > 0) {
                    l.warn('Pre-existing data found! Canceling creation due to probable conflict.')
                    l.warn(pre_search_id)
                    return res.status(409).json({
                        success: false,
                        data: null,
                        error: {
                            message: `There is already existing record(s) with ${JSON.stringify(pre_search_payload).replaceAll('\"', "'")}`,
                            details: pre_search_id || 'No details.'
                        }
                    })
                }
            }

            // creating
            l.info('Creating record')
            result = await this.Model.create(validated_payload)
            
            // returning
            l.info('Returning')
            if (!result.success) throw result?.error || new Error(`Unknown error: ${JSON.stringify(result)}}`)
            return res.status(200).json({
                success: true,
                message: 'Record created successfully',
                data: result.data
            })
        } catch (error) {
            return next(error);
        }
    }

    async query(req, res, next) {
        const l = this.__getLogger('query');
        try {
            let search_data, validated_search_data, result;
            const hasQuery = Object.keys(req.query).length > 0;
            const hasParam = Object.keys(req.params).length > 0;
            const handlers = {
                query: async (query) => {
                    let schema = await this.getSchema({ merge_with: this.Schema.read(), as_skeleton: true });
                    return schema.strict().parse(query);
                }
            }

            // what is happening: list or search? search via query or params?
            if (hasQuery) {
                l.debug(`${req.logprefix} Query detected`);
                search_data = req.query;
            } else if (hasParam) {
                l.debug(`${req.logprefix} Params detected`);
                search_data = req.params;
            } else {
                l.info(`${req.logprefix} Listing all records`);
                result = await this.Model.list();
                return res.status(200).json({
                    success: true,
                    message: 'All records retrieved successfully',
                    data: result.data
                })
            }

            // validating
            l.info(`${req.logprefix} Validating schema...`)
            validated_search_data = await handlers.query(search_data);

            // returning
            l.info(`${req.logprefix} Searching on model...`)
            result = await this.Model.find(this.filterify(validated_search_data));
            if (!result.success) throw result?.error || new Error(`Unknown error: ${JSON.stringify(result)}}`)
            return res.status(200).json({
                success: true,
                message: 'Records retrieved successfully',
                data: result.data
            })

        } catch (error) {
            l.error(`${req.logprefix} Error:`, error)
            return next(error)
        }
    };


    async update(req, res, next, options = { block_api_param: ['id'] }) {
        const l = this.__getLogger('update');
        try {
            let idToUpdate, payload, validated_payload, result, update_schema

            l.info(`${req.logprefix} Validating ID...`)
            idToUpdate = await this.getId(req.params)
            if (!idToUpdate) {
                l.info(`${req.logprefix} ID not found`)
                return res.status(404).json({
                    success: false,
                    error: 'Target record does not exist'
                })
            } else if (idToUpdate.length > 1) {
                l.info(`${req.logprefix} Multiple records found`)
                return res.status(400).json({
                    success: false,
                    error: 'Multiple records found'
                })
            } else {
                l.info(`${req.logprefix} ID found`)
                idToUpdate = parseInt(idToUpdate[0])
            }

            // validating
            payload = { ...req.body, id: idToUpdate }
            l.info(`${req.logprefix} Validating payload...`)
            update_schema = await this.getSchema({
                merge_with: this.Schema.update(),
                as_skeleton: true,
                block_api_param: options.block_api_param
            })
            validated_payload = update_schema.strict().parse(payload)

            // updating
            result = await this.Model.update(validated_payload)

            // returning
            if (!result.success) throw new Error(result.error)
            return res.status(200).json({
                success: true,
                message: 'Record updated successfully',
                data: result.data
            })
        } catch (error) {
            return next(error)
        }
    }

    async delete(req, res, next) {
        const l = this.__getLogger('delete');
        try {
            l.info(`${req.logprefix} Validating ID...`)
            let idToDelete = await this.getId(req.params)
            if (!idToDelete) {
                return res.status(404).json({
                    success: false,
                    error: 'Target record does not exist'
                })
            } else if (idToDelete.length > 1) {
                l.info(`${req.logprefix} Multiple records found`)
                return res.status(400).json({
                    success: false,
                    error: 'Multiple records found'
                })
            } else {
                idToDelete = parseInt(idToDelete[0])
            }

            l.info(`${req.logprefix} Deleting record...`)
            const result = await this.Model.delete({ id: idToDelete })
            l.debug(`${req.logprefix} ${JSON.stringify(result)}`)

            if (!result.success) {
                return res.status(500).json(result)
            }
            return res.status(200).json(result)

        } catch (error) {
            return next(error)
        }
    }

    async getId(searchObject) {
        const l = this.__getLogger('getId')
        let payload = this.filterify(searchObject)
        const result = await this.Model.find(payload)
        const data = result?.data

        if (!result.success) throw result?.error || new Error(`Unknown error: ${JSON.stringify(result)}}`)

        if (!data || data?.count === 0 || data?.rows?.length === 0) {
            l.debug('No record found', searchObject)
            return null
        }

        if (data?.count > 1 || data?.rows?.length > 1) {
            const foundIds = data?.rows.map(row => row.id)
            l.debug(`Multiple records found: ${foundIds}`, searchObject)
            return foundIds
        }

        const foundId = data?.rows[0].id
        l.debug(`Found id: ${foundId}`, searchObject)
        return [foundId] // return as array for consistency
    }

}

export default BaseController;