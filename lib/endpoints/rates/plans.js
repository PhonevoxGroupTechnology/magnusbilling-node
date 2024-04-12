const _MODULE = 'plan'

function preEndpointCreation(data) {
    // Validações necessárias pré-criação do endpoint.

    // // Mapeamento de algumas str->num para packagetype
    // if (data.packagetype && typeof(data.packagetype) === 'string') {
    //     data.packagetype = validateStringPackagetype(data.packagetype)
    // }

    // // Mapeamento de algumas str->num para billingtype
    // if (data.billingtype && typeof(data.billingtype) === 'string') {
    //     data.billingtype = validateStringBillingtype(data.billingtype)
    // }
}

PLANS_ENDPOINT = (Magnode) => ({
    add: async (data) => {
        try {
            preEndpointCreation(data) // validações necessárias antes da criação do endpoint
            const endpoint = await Magnode.generateEndpoint("save", _MODULE, {
                id: {fixed: 0},
                name: {required: true}, // ja tem na api 🤓
                id_services_array: {default: ''},
                signup: {default: 0},
                ini_credit: {default: 0.0000},
                play_audio: {default: 1},
                portabilidadeMobile: {default: 0},
                portabilidadeFixed: {default: 0},
                techprefix: {default: ''},
                id_services: {default: ''},
            });
            return endpoint(data);
        } catch (err) {
            throw err;
        }
    },


    edit: async (data) => {
        try {
            preEndpointCreation(data) // validações necessárias antes da criação do endpoint
            const endpoint = await Magnode.generateEndpoint("save", _MODULE, {
                id: {required: true}
            });
            return endpoint(data);
        } catch (err) {
            throw err;
        }
    },


    remove: async (data) => {
        try {
            const endpoint = await Magnode.generateEndpoint("destroy", _MODULE, {
                id: {required: true}
            });
            return endpoint(data);
        } catch (err) {
            throw err;
        }
    },


    find: async (data) => {
        try {
            const endpoint = await Magnode.generateEndpoint("read", _MODULE, {
                filtro: {required: true}
            });
            return endpoint(data);
        } catch (err) {
            throw err;
        }
    },


    getid: async (data) => {
        try {
            const endpoint = await Magnode.generateEndpoint("read", _MODULE, {
                filtro: {required: true}
            });
            ret = await endpoint(data);

            if ( ret.rows.length === 1 ) {
                return ret.rows[0].id
            } else {
                throw new Error("Quantidade inesperada de retorno pelo getid!")
            }

        } catch (err) {
            throw err;
        }
    },

    
    list: async () => {
        try {
            const endpoint = await Magnode.generateEndpoint("read", _MODULE, {});
            return endpoint({});
        } catch (err) {
            throw err;
        }
    },
})

module.exports = {
    PLANS_ENDPOINT
}