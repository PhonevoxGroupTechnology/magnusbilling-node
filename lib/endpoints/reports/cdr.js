const _MODULE = 'call'

CDR_ENDPOINT = (Magnode) => ({
    // não existe método add pra cdr, até onde eu saiba 🤓

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
    CDR_ENDPOINT
}