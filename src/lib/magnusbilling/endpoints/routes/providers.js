const _MODULE = 'provider'

// function validateStringPackagetype(val) {
//     // packagetype
//     // 0: Unlimited calls
//     // 1: Number free calls
//     // 2: Free seconds

//     if (typeof(val) === 'string') {
//         switch (val.toLowerCase()) {
//             case 'unlimited_calls':
//             case 'unlimited':
//             case '0':
//                 return 0
//             case 'number_free_calls':
//             case 'free_calls':
//             case '1':
//                 return 1
//             case 'free_seconds':
//             case 'seconds':
//             case '2':
//                 return 2
//             default:
//                 return val
//         }
//     } else {
//         return val
//     }
// }

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

    // // Mapeamento de algumas str->num para packagetype
    // if (data.packagetype && typeof(data.packagetype) === 'string') {
    //     data.packagetype = validateStringPackagetype(data.packagetype)
    // }

    // // Mapeamento de algumas str->num para billingtype
    // if (data.billingtype && typeof(data.billingtype) === 'string') {
    //     data.billingtype = validateStringBillingtype(data.billingtype)
    // }
}

PROVIDERS_ENDPOINT = (Magnode) => ({
    add: async (data) => {
        try {
            preEndpointCreation(data) // validações necessárias antes da criação do endpoint
            const endpoint = await Magnode.generateEndpoint("save", _MODULE, {
                id: {fixed: 0},
                provider_name: {required: true} // isso ja vem da api 🤓
            });

            return endpoint(data);
        } catch (err) {
            throw err;
        }
    },


    edit: async (data) => {
        try {
            preEndpointCreation(data) // validações necessárias nos argumentos para mapear string pra numero, somente em alguns args
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
    PROVIDERS_ENDPOINT
}