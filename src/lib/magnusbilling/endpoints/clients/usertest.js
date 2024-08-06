const path = require("path");
const { EndpointMethodManager } = require(path.resolve("src/lib/magnusbilling/managers"))

const MODULE = 'user';

const endpoint = new EndpointMethodManager(MODULE);

endpoint.addMethod('add', {
    action: 'save',
    rules: {
        active: {default: 1},
        id_group: {default: 3}, // client
        createUser: {required: true, fixed: 1}, // obrigatório para CRIAR user
        id: {fixed: 0}, // obrigatório para CRIAR user
        email: {required: true}, // na web nao é obrigatório, mas aqui é. vai entender
    },
    handle: async (data, magnus, module, action, rules) => {
        const generatedEndpoint = await magnus.generateEndpoint(action, module, rules);
        return generatedEndpoint(data);
    }
})

endpoint.addMethod('edit', {
    action: 'save',
    rules: {
        id: {required: true}
    },
    handle: async (data, magnus, module, action, rules) => {
        const generatedEndpoint = await magnus.generateEndpoint(action, module, rules, true);
        return generatedEndpoint(data);
    }
})

endpoint.addMethod('remove', {
    action: 'destroy',
    rules: {
        id: {required: true}
    },
    handle: async (data, magnus, module, action, rules) => {
        const generatedEndpoint = await magnus.generateEndpoint(action, module, rules);
        return generatedEndpoint(data);
    }
})

endpoint.addMethod('find', {
    action: 'read',
    rules: {
        filtro: {required: true}
    },
    handle: async (data, magnus, module, action, rules) => {
        const generatedEndpoint = await magnus.generateEndpoint(action, module, rules);
        return generatedEndpoint(data);
    }
})

endpoint.addMethod('list', {
    action: 'read',
    rules: {},
    handle: async (data = {}, magnus, module, action, rules) => {
        // Eu não preciso de dados pra esse endpoint. Qualquer coisa que for repassada será ignorada.
        const generatedEndpoint = await magnus.generateEndpoint(action, module, rules);
        return await generatedEndpoint(data);
    }
})

endpoint.addMethod('getid', {
    action: 'read',
    rules: {
        filtro: {required: true}
    },
    handle: async (data, magnus, module, action, rules) => {
        const generatedEndpoint = await magnus.generateEndpoint(action, module, rules);
        ret = await generatedEndpoint(data);

        if ( ret.rows.length !== 1 ) {            
            throw new Error("Quantidade inesperada de retorno pelo getid!")
        }

        const foundId = ret.rows[0].id;
        return foundId;
    }
})

module.exports = endpoint
