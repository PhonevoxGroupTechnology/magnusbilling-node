// "voip_call"
const _MODULE = 'diddestination'

DIDDESTINATION_ENDPOINT = (Magnode) => ({
    add: async (data) => {
        try {

            let LOGIC_ARGUMENTS
            EP_ARGUMENTS =  {
                id_did: {required: true}
            }

            // Determinando o tipo da chamada pra poder setar o voip_call correto.
            if (!data.voip_call) {
                if (!data.type) {
                    throw new Error("Repasse o tipo da chamada! (argumento type)").stack
                    // pstn | sip | ivr | direct_extension | cid_callback | 0800_callback 
                    // queue | sip_group | custom | context | multiple_ips
                } else {

                    // Não quero que o usuário escreva números: terá de repassar "data.type", e baseado nisso, passo os números pro objeto de data do cliente.
                    switch (data.type.toLowerCase()) {
                        case 'call_to_pstn':
                        case 'pstn':
                            EP_ARGUMENTS.destination = {required: true}
                            EP_ARGUMENTS.id_sip, EP_ARGUMENTS.context, EP_ARGUMENTS.id_ivr, EP_ARGUMENTS.id_queue = {prohibited: true}
                            EP_ARGUMENTS.voip_call = {fixed: 0}
                            break;
                        case 'sip':
                            EP_ARGUMENTS.id_sip = {required: true}
                            EP_ARGUMENTS.destination, EP_ARGUMENTS.context, EP_ARGUMENTS.id_ivr, EP_ARGUMENTS.id_queue = {prohibited: true}
                            EP_ARGUMENTS.voip_call = {fixed: 1}
                            break;
                        case 'ivr':
                            EP_ARGUMENTS.id_ivr = {required: true}
                            EP_ARGUMENTS.destination, EP_ARGUMENTS.context, EP_ARGUMENTS.id_sip, EP_ARGUMENTS.id_queue = {prohibited: true}
                            EP_ARGUMENTS.voip_call = {fixed: 2}
                            break;
                        case 'callingcard':
                            throw new Error('Esse tipo ainda não está implementado! :)')
                            EP_ARGUMENTS.voip_call = {fixed: 3}
                            break;
                        case 'direct_extension':
                            throw new Error('Esse tipo ainda não está implementado! :)')
                            EP_ARGUMENTS.voip_call = {fixed: 4}
                            break;
                        case 'cid_callback':
                            throw new Error('Esse tipo ainda não está implementado! :)')
                            EP_ARGUMENTS.voip_call = {fixed: 5}
                            break;
                        case '0800_callback':
                            throw new Error('Esse tipo ainda não está implementado! :)')
                            EP_ARGUMENTS.voip_call = {fixed: 6}
                            break;
                        case 'queue':
                            EP_ARGUMENTS.id_queue = {required: true}
                            EP_ARGUMENTS.destination, EP_ARGUMENTS.context, EP_ARGUMENTS.id_sip, EP_ARGUMENTS.id_ivr = {prohibited: true}
                            EP_ARGUMENTS.voip_call = {fixed: 7}
                            break;
                        case 'sip_group':
                            throw new Error('Esse tipo ainda não está implementado! :)')
                            EP_ARGUMENTS.voip_call = {fixed: 8}
                            break;
                        case 'custom':
                            throw new Error('Esse tipo ainda não está implementado! :)')
                            EP_ARGUMENTS.voip_call = {fixed: 9}
                            break;
                        case 'context':
                            EP_ARGUMENTS.context = {required: true}
                            EP_ARGUMENTS.destination, EP_ARGUMENTS.id_sip, EP_ARGUMENTS.id_ivr, EP_ARGUMENTS.id_queue = {prohibited: true}
                            EP_ARGUMENTS.voip_call = {fixed: 10}
                            data.voip_call = 10
                            break;
                        case 'multiple_ips':
                            EP_ARGUMENTS.id_sip = {required: true}
                            EP_ARGUMENTS.destination, EP_ARGUMENTS.context, EP_ARGUMENTS.id_ivr, EP_ARGUMENTS.id_queue = {prohibited: true}
                            EP_ARGUMENTS.voip_call = {fixed: 10}
                            NEEDED_ARGS = ['id_sip']
                            BLOCKED_ARGS = ['voip_call', 'destination', 'context', 'id_ivr', 'id_queue', 'context']
                            data.voip_call = 11
                            break;
                        default:
                            break;
                    }
                }
            }

            // action, module, expecteds, defaults, fixeds
            const endpoint = await Magnode.generateEndpoint("save", _MODULE, EP_ARGUMENTS);
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
    DIDDESTINATION_ENDPOINT
}