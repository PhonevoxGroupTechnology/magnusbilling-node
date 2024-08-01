// Para ADICIONAR créditos, utilize o método add, com um valor POSITIVO
// Para REMOVER créditos, utilize o método add, com um valor NEGATIVO.

const _MODULE = 'refill'

REFILL_ENDPOINT = (Magnode) => ({
    add: async (data) => {
        try {
            // action, module, expecteds, defaults, fixeds
            const endpoint = await Magnode.generateEndpoint("save", _MODULE, {
                id_user: {required: true},
                credit: {required: true},
                description: {default: 'API'},
                id: {fixed: 0},
            });
            return endpoint(data);
        } catch (err) {
            throw err;
        }
    },


    edit: async (data) => {
        try {
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
    REFILL_ENDPOINT
}