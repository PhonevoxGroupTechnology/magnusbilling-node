import MagnusModel from '../models/MagnusModel.js'
import { zodToJson } from '../utils/utils.js';

class MagnusController {
    constructor() {
    }

    // Use this to send requests straight to MagnusModel.query
    // api/tests/query
    async _testQuery(req, res) {
        return res.json(await MagnusModel.query(req.body))
    }

    // Use this to get the parsed api rules from MagnusModel.getRules
    // api/tests/rules/:module
    async _getParsedRule(req, res) {
        const { module } = req.params;
        let rules = await MagnusModel.getRules(module, false, true)
        // rules = zodToJson(rules)

        res.json(rules)
    }
}

export default new MagnusController()