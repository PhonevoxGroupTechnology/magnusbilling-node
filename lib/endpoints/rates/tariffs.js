const _MODULE = 'rate'

TARIFFS_ENDPOINT = (Magnode) => ({
    add: async (data) => {
        try {
            // action, module, expecteds, defaults, fixeds
            const endpoint = await Magnode.generateEndpoint("save", _MODULE, {
                id: {fixed: 0},
                id_plan: {required: true},
                id_trunk_group: {required: true},
                id_prefix: {required: true},
                rateinitial: {default: 0},
                initblock: {default: 1},
                billingblock: {default: 1},
                connectcharge: {default: 0},
                disconnectcharge: {default: 0},
                additional_grace: {default: "0"}, // why?
                minimal_cost: {default: 0},
                minimal_time_charge: {default: 0},
                package_offer: {default: 0},
                status: {default: 1},
            }, true);
            return endpoint(data);
        } catch (err) {
            throw err;
        }
    },


    edit: async (data) => {
        try {
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
    TARIFFS_ENDPOINT
}