const _MODULE = 'trunkGroup'

function validateStringType(val) {
    // packagetype
    // 0: Unlimited calls
    // 1: Number free calls
    // 2: Free seconds

    if (typeof(val) === 'string') {
        switch (val.toLowerCase()) {
            case 'order':
                return 1
            case 'random':
                return 2
            case 'lcr':
                return 3
            default:
                return val
        }
    } else {
        return val
    }
}

// function validateStringBillingtype(val) {
//     // billingtype
//     // 0: Monthly
//     // 1: Weekly

//     if (typeof(val) === 'string') {
//         switch (val.toLowerCase()) {
//             case 'monthly':
//             case '0':
//                 return 0
//             case 'weekly':
//             case '1':
//                 return 1
//             default:
//                 return val
//         }
//     } else {
//         return val
//     }
// }

function preEndpointCreation(data) {
    // Validações necessárias pré-criação do endpoint.

    // Mapeamento de algumas str->num para packagetype
    if (data.type && typeof(data.type) === 'string') {
        data.type = validateStringType(data.type)
    }

    // // Mapeamento de algumas str->num para billingtype
    // if (data.billingtype && typeof(data.billingtype) === 'string') {
    //     data.billingtype = validateStringBillingtype(data.billingtype)
    // }
}

TRUNKGROUPS_ENDPOINT = (Magnode) => ({
    add: async (data) => {
        try {
            preEndpointCreation(data) // validações necessárias antes da criação do endpoint
            const endpoint = await Magnode.generateEndpoint("save", _MODULE, {
                id: {fixed: 0}, // Necessário para CRIAÇÃO
                name: {required: true},
                description: {default: ""},
                id_trunk: {default: ""},
                weight: {default: ""},
                type: {default: 1} // 1:order | 2:random | 3:LCR (lowest cost rate?)
                // id_trunk // um Array com a lista dos ids de troncos a serem usados nesse TrunkGroup. id_trunk: [1, 2, 3]
            }, true);

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
            }, true);
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

    
    list: async (data = {}) => {
        try {
            const endpoint = await Magnode.generateEndpoint("read", _MODULE, {});
            return endpoint(data);
        } catch (err) {
            throw err;
        }
    },
})

module.exports = {
    TRUNKGROUPS_ENDPOINT
}