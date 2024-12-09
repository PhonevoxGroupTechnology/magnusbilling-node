import Magnus from '../models/MagnusModel.js'

const MagnusModel = new Magnus();

export default class MagnusController {
    constructor() {
    }

    // Use this to send requests straight to MagnusModel.query
    // api/tests/query
    async _testQuery(req, res) {
        return res.json(await MagnusModel.query(req.body))
    }
}