// Simplesmente não consigo fazer os campos permitirem caracteres especiais (*).
// Acho que tem algo a ver com o envio da requisição, e o tal do URL-Encoded. A requisição deve estar sendo formatada errada ou algo assim. 
// Não vou me esforçar pra resolver isso agora, pois ESTE endpoint em específico raramente é utilizado.
// TODO: "Permitir" que os campos enviem *

const _MODULE = 'sipuras'

ATALINKSYS_ENDPOINT = (Magnode) => ({
    add: async (data) => {
        try {
            let asterisco = "*"
            asterisco = asterisco.toString()

            // action, module, expecteds, defaults, fixeds
            const endpoint = await Magnode.generateEndpoint("save", _MODULE, {
                id: {fixed: 0},
                id_user: {required: true},
                nserie: {required: true},
                macadr: {required: true},
                Enable_Web_Server: {default: 'yes'},
                Dial_Plan_1: {default: `(xx|[3469]11|0|00|[2-9]xxxxxx|1xxx[2-9]xxxxxxS0|xxxxxxxxxxxx.)`},
                Dial_Plan_2: {default: `(xx|[3469]11|0|00|[2-9]xxxxxx|1xxx[2-9]xxxxxxS0|xxxxxxxxxxxx.)`},
                Register_Expires_1: {default: '360'},
                Register_Expires_2: {default: '360'},
                NAT_Mapping_Enable_1_: {default: 'no'},
                NAT_Mapping_Enable_2_: {default: 'no'},
                NAT_Keep_Alive_Enable_1_: {default: 'no'},
                NAT_Keep_Alive_Enable_2_: {default: 'no'},
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
    ATALINKSYS_ENDPOINT
}