const { createEndpoint } = require('../endpointController');

// Isso tá feio demais 💀 mas funciona (in)felizmente.

ENDPOINT_USER = (MagnusBillingInstance) => ({

    add: async (data) => {
        const ArgumentObject = {
            expects: [
                { args: ['username','password','email'], logic: 'AND' },
                { args: ['id_plan', 'id_plan_filtro'], logic: 'NAND' },
                { args: ['id', 'createUser', 'module', 'action'], logic: '!OR' }
            ],
            payload: {
                default: [
                    // { // Isso não precisa existir para o endpoint NEW!
                    //     dataArgToCheck: 'id_user_filtro', // Checo a presença desse argumento
                    //     payloadArgToSet: 'id_user', // Pra setar esse argumento
                    //     dataArgIsPresent: async (data_dataArgToCheck) => { // Se estiver presente, uso isso (data.dataArgToCheck)
                    //         return await this.clients.users.fGetId(data_dataArgToCheck)
                    //     },
                    //     // dataArgIsPresent: '5',
                    //     dataArgIsMissing: '0' // Se estiver ausente, uso isso
                    // },
                    {
                        dataArgToCheck: 'id_group', // Arg a consultar
                        payloadArgToSet: 'id_group', // Arg a setar
                        dataArgIsPresent: data.id_group, // Valor caso esteja presente
                        dataArgIsMissing: '3' // Default (caso esteja ausente)
                    },
                    {
                        dataArgToCheck: 'active',
                        payloadArgToSet: 'active',
                        dataArgIsPresent: data.active,
                        dataArgIsMissing: 1
                    }
                ],                        
                fixed: {
                    createUser: 1,
                    id: 0,
                }
            }   
        };
        const endpoint = await createEndpoint(MagnusBillingInstance, 'user', 'save', ArgumentObject); // Criando o endpoint 'new'
        return await endpoint(data); // Chamando o endpoint 'new' com os dados fornecidos
    },



    find: async (data) => {
        const ArgumentObject = {
            expects: [
                { args: ['filtro'], logic: 'AND' },
                { args: ['module', 'action'], logic: '!OR' }
            ],
            payload: { // nao preciso editar a payload em uma CONSULTA
            }   
        };
        const endpoint = await createEndpoint(MagnusBillingInstance, 'user', 'read', ArgumentObject); // Criando o endpoint 'new'
        return await endpoint(data); // Chamando o endpoint 'new' com os dados fornecidos
    }
})

module.exports = {
    ENDPOINT_USER,
}