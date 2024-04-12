// O módulo CallOnLine só pode receber requisições read.
// Referência: https://github.com/magnussolution/magnusbilling7/issues/643#issuecomment-1607478548

// Aparentemente, o botão "Desligar chamada" envia um DESTROY formatado desta maneira:
// rows: [
//     {channel: 'canal'},
//     {channel: 'canal2'}
// ]

const _MODULE = 'CallOnLine'

CALLONLINE_ENDPOINT = (Magnode) => ({
    hangup: async (data) => {
        try {
            const endpoint = await Magnode.generateEndpoint("destroy", _MODULE, {
                rows: {prohibited: true}
            });

            // TODO: Talvez eu devesse subir essas verificações pra cima? Estou gastando processamento (acima) em algo que PODE falhar.

            // Verifica se data.rows é um array
            if (!Array.isArray(data.rows)) {
                throw new Error('data.rows precisa ser um array');
            }
            
            // Conferindo se as chaves de data.row são nomeadas "channel"
            for (const row of data.rows) {
                if (typeof row !== 'object' || Object.keys(row).length !== 1 || typeof row.channel !== 'string') {
                    throw new Error('Cada membro de data.rows precisa ser um objeto com uma chave "channel"');
                }
            }

            return endpoint(data)
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
    CALLONLINE_ENDPOINT
}