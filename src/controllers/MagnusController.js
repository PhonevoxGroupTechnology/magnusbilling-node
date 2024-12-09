import Magnus from '../models/MagnusModel.js'

const MagnusModel = new Magnus()

export default class MagnusController {
    constructor() {
    }

    testUser(req, res) {

        const result_clientes_existentes = MagnusModel.getClientes()
        res.send(result_clientes_existentes)
    }
}