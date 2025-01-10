import { logging } from '../../utils/logging.js'
import CallOnlineModel from '../../models/clients/CallOnlineModel.js'
import CallOnlineSchema from '../../schemas/clients/CallOnlineSchema.js'
import BaseController from '../BaseController.js'

// This Endpoint's methods are pretty unique and not CRUD.
// We will manually create each request, without the use of the BaseController.

class CallOnlineController extends BaseController {
    constructor() {
        super(CallOnlineSchema, CallOnlineModel);
        this.settings.useApiRules = false; // API has no rules
    }

    hangup = async (req, res, next) => {
        const l = this.__getLogger('hangup');
        l.info('this is test')

        // request has to 


        return res.status(200).json({
            success: true,
            message: 'test',
            data: null
        });
    }

    list = async (req, res, next) => {
        const l = this.__getLogger('list');
        try {
            let result = await CallOnlineModel.list();
            if (!result.success) throw result?.error || new Error(`Unknown error: ${JSON.stringify(result)}}`)
            return res.status(200).json({
                success: true,
                message: 'Records retrieved successfully',
                data: result.data
            })
        } catch (error) {
            l.critical(error)
            next(error)
        }
        
    }

    spy = async(req, res, next) => {
        const l = this.__getLogger('spycall');
        try {
            let payload

            // validate
            payload = this.Schema.spy().strict().parse(req.body);

            // send req and get res
            let result = await CallOnlineModel.spy(payload);
            if (!result.success) throw result?.error || new Error(`Unknown error: ${JSON.stringify(result)}}`)
            return res.status(200).json({
                success: true,
                message: 'Records retrieved successfully',
                data: result.data
            })
        } catch (error) {
            l.critical(error)
            next(error)
        }
    }

    create = async (req, res, next) => res.status(404).json({
        success: false,
        message: 'Method not available',
        data: null
    })

    // query = async (req, res, next) => res.status(404).json({
    //     success: false,
    //     message: 'Method not available',
    //     data: null
    // })

    update = async (req, res, next) => res.status(404).json({
        success: false,
        message: 'Method not available',
        data: null
    })

    delete = async (req, res, next) => res.status(404).json({
        success: false,
        message: 'Method not available',
        data: null
    })

}

export default new CallOnlineController()