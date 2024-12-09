import User from '../../models/clients/UserModel.js'

const UserModel = new User();
export default class UserController {
    constructor() {
    }

    async create(req, res) {
        return res.json('batata')
    }

    async get(req, res) {
        res.send('get')
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
        console.log('inside controller:getrules')
        return res.json(await UserModel.getRules())
    }
}