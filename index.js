const axios = require('axios');

const { interpretarOperador } = require('./lib/Utils');

class MagnusBilling {
    constructor(api_key, api_secret, public_url) {
        this.api_key = api_key;
        this.api_secret = api_secret;
        this.public_url = public_url;
        this.filter = [];
    }

    async query(req = {}) {
        let { module, action } = req;
        module = module ?? '';
        action = action ?? '';

        // Gerar um nonce para evitar problemas com sistemas de 32 bits
        const mt = new Date().getTime().toString();
        req.nonce = mt.slice(-10) + mt.substr(2, 6);

        // Gerar a string de dados POST
        const post_data = new URLSearchParams(req).toString();
        const sign = require('crypto').createHmac('sha512', this.api_secret).update(post_data).digest('hex');

        // Gerar os cabeçalhos extras
        const headers = {
            'Key': this.api_key,
            'Sign': sign
        };
        
        console.log(`Sending request to ${this.public_url}/index.php/${module}/${action}`)
        console.log(`Data: ${JSON.stringify(post_data)}`)
        console.log(`Headers: ${JSON.stringify(headers)}`)
        console.log(`Request: ${JSON.stringify(req)}`)
        
        try {
            const response = await axios.post(`${this.public_url}/index.php/${module}/${action}`, post_data, {
                headers: headers,
                httpsAgent: {
                    rejectUnauthorized: false // Para ignorar a verificação do certificado SSL
                }
            });

            console.log(`Response: ${JSON.stringify(response.data)}`)
            return response.data;
        } catch (error) {
            console.log(`[${error.status}/${error.code}] --> ${error.config.method}:${error.config.url} [${error.config.data}]`)
            throw new Error(`Axios error: ${error.message}`);
        }
    }

    async create(module, data = {}) {
        data.module = module;
        data.action = 'save';
        data.id = 0;
    
        return await this.query(data);
    }
    
    async createDID(data) {
        return await this.create('did', data)
    }

    async update(module, id, data) {
        data.module = module;
        data.action = 'save';
        data.id = id;
    
        return await this.query(data);
    }

    async destroy(module, id) {
        return await this.query({
            module: module,
            action: 'destroy',
            id: id
        });
    }

    async read(module, page = 1, action = 'read') {
        return await this.query({
            module: module,
            action: action,
            page: page,
            start: page === 1 ? 0 : (page - 1) * 25,
            limit: 25,
            filter: JSON.stringify(this.filter)
        });
    }

    async buyDID(id_did, id_user) {
        return await this.query({
            module: 'did',
            action: 'buy',
            id: id_did,
            id_user: id_user
        });
    }

    async getFields(module) {
        return await this.query({
            module: module,
            getFields: 1
        });
    }

    async createDID(data) {
        /* 
        data = {
            "did": 
        }
        */
        return await this.query(data)
    }

    async createUser(data) {
        data.createUser = 1;
        data.id = 0;
    
        return await this.query(data);
    }
    
    async getModules() {
        return await this.query({
            getModules: 1
        });
    }
    
    async getMenu(username) {
        return await this.query({
            username: username,
            getMenu: 1
        });
    }
    
    async getId(module, field, value) {
        this.setFilter(field, value, 'eq');
    
        const query = await this.query({
            module: module,
            action: 'read',
            page: 1,
            start: 0,
            limit: 1,
            filter: JSON.stringify(this.filter)
        });
    
        this.clearFilter();
    
        if (query.rows && query.rows[0]) {
            return query.rows[0];
        } else {
            throw new Error('Usuário não encontrado.');
        }
    }
    
    clearFilter() {
        this.filter = [];
    }

    setFilter(field, value, comparison = 'st', type = 'string') {
        this.filter.push({
            type: type,
            field: field,
            value: value,
            comparison: interpretarOperador(comparison)
        });
    }

    getFilters(filterList) {
        if (filterList.length > 0) {
            filterList.forEach(filtro => {
                console.log(`Filtros recebidos: ${filtro}`);
                const [campo, operador, valor, tipo] = filtro;
                console.log('Campo    : ' + campo);
                console.log('Operador : ' + operador);
                console.log('Valor    : ' + valor);
                console.log('Tipo     : ' + tipo);
                this.setFilter(campo, valor, operador, tipo);
            });
        }
    }

    _ExpectedArgs(data, expectedArgs) {
        const missingArgs = expectedArgs.filter(arg => !(arg in data));
        if (missingArgs.length > 0) {
            throw new Error(`Missing arguments: ${missingArgs.join(', ')}`);
        }
    }




    // API Simplificada
    clients = {
        users: {
            new: async (data) => {
                this._ExpectedArgs(data, ['usuario', 'senha', 'email'])
                /*
                usuario: '123123'
                senha: '123123'
                email: '123123@gmail' //  n deveria ser obrigatorio
                id_grupo: 3
                id_plano: 1
                */
                let payload = {
                    createUser: 1,
                    id: 0,
                    username: data.usuario, // Obrigatório
                    password: data.senha, // Obrigatório
                    email: data.email, // Obrigatório
                    active: data.ativo ?? 1, // Default: ativo (pois estou CRIANDO um usuário)
                    id_group: data.id_grupo ?? 3, // Default: Cliente
                    ...(data.primeiro_nome !== undefined && { firstname: data.primeiro_nome }), // Opcional
                    ...(data.ultimo_nome !== undefined && { lastname: data.ultimo_nome }), // Opcional
                    ...(data.id_plano !== undefined && { id_plan: data.id_plano }), // Opcional
                    ...(data.credito !== undefined && { credit: data.credito }), // Opcional
                    ...(data.limite_chamadas !== undefined && { calllimit: data.limite_chamadas }), // Opcional
                }
                return await this.query(payload);
            },
            find: async (filters) => {
                let module = 'user';
                if (filters !== undefined && filters.length > 0) {
                    this.getFilters(filters)
                }
                return await this.read(module);
            },
            delete: async (data) => {
                this._ExpectedArgs(data, ['id'])
                let module = 'user';
                // É importante citar que o ID esperado aqui, não é id_user. É, realmente, o ID interno do usuário. "id"
                return await this.destroy(module, data.id);
            }
        },
        sipUsers: {
            new: async (data) => {
                // Adicionar conta SIP
            },
        }
    };

    billing = {
        refills: {
            new: async (data) => {
                // Adicionar recarga
            }
        }
    }

    dids = {
        dids: {
            new: async (data) => {
                // Lógica para adicionar DID
            }
        },
        didDestination: {
            new: async (data) => {
                // Lógica para adicionar destino de DID
            }
        }
    };

    rates = {
        plans: {
            new: async (data) => {
                // Adicionar plano
            }
        },
        tariffs: {
            new: async (data) => {
                // Adicionar tarifa
            }
        },
        prefixes: {
            new: async (data) => {
                //Adicionar prefixo
            }
        }
    }

    routes = {
        providers: {
            new: async (data) => {
                // Adicionar provedor
            }
        },
        trunks: {
            new: async (data) => {
                // Adicionar tronco
            }
        },
        trunkGroups: {
            new: async (data) => {
                // Adicionar grupo de tronco
            }
        }
    }

}

module.exports = {
    MagnusBilling
}
