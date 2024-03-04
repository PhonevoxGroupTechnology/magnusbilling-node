const { createEndpoint } = require('../endpointController');

// Isso tá feio demais 💀 mas funciona (in)felizmente.

ENDPOINT_SIP = (MagnusBillingInstance) => ({

    find: async (data) => {
        const ArgumentObject = {
            expects: [
                { args: ['filtro'], logic: 'AND' },
            ],
            payload: { // nao preciso editar a payload em uma CONSULTA
            }   
        };
        const endpoint = await createEndpoint(MagnusBillingInstance, 'sip', 'read', ArgumentObject); // Criando o endpoint 'new'
        return await endpoint(data); // Chamando o endpoint 'new' com os dados fornecidos
    }
})

module.exports = {
    ENDPOINT_SIP,
}