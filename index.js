const axios = require('axios');

const { interpretarOperador } = require('./lib/Utils');
const { InvalidOperator, Denied, ExpectedArgumentMissing} = require('./lib/errors')

class MagnusBilling {
    constructor(api_key, api_secret, public_url) {
        this.api_key = api_key;
        this.api_secret = api_secret;
        this.public_url = public_url;
        this.filter = [];


        
        this._mappingSinaisOperacao = {
            '^': 'st',   // starts with   | começa com
            '$': 'ed',   // ends with     | termina com
            '~=': 'ct',  // contains      | contém
            '*': 'ct',   // contains      | contém (v2.0)
            '=': 'eq',   // equal         | igual
            '<': 'lt',   // less than     | menor que
            '>': 'gt',   // greater than  | maior que
        }
        this._validSinaisOperacao = ['st', 'ed', 'ct', 'eq', 'lt', 'gt']

        this._mappingTraducaoCampos = {
            'id': 'id',
            'id_usuario': 'id_user',
            'id_grupo': 'id_group',
            'id_grupo_agente': 'id_group_agent',
            'id_plano': 'id_plan',
            'id_oferta': 'id_offer',
            'usuario': 'username',
            'senha': 'password',
            'credito': 'credit',
            'ativo': 'active',
            'data_criacao': 'creationdate',
            'data_primeiro_uso': 'firstusedate',
            'data_expiracao': 'expirationdate',
            'ativar_expiracao': 'enableexpire',
            'dias_expiracao': 'expiredays',
            'sobrenome': 'lastname',
            'nome': 'firstname',
            'endereco': 'address',
            'cidade': 'city',
            'bairro': 'neighborhood',
            'estado': 'state',
            'pais': 'country',
            'cep': 'zipcode',
            'telefone': 'phone',
            'celular': 'mobile',
            'email': 'email',
            'email2': 'email2',
            'vat': 'vat',
            'nome_empresa': 'company_name',
            'nome_comercial': 'commercial_name',
            'website_empresa': 'company_website',
            'numero_estado': 'state_number',
            'dist': 'dist',
            'valor_contrato': 'contract_value',
            'ultima_utilizacao': 'lastuse',
            'tipo_pagamento': 'typepaid',
            'limite_credito': 'creditlimit',
            'idioma': 'language',
            'redial': 'redial',
            'chave_login': 'loginkey',
            'ultima_notificacao': 'last_notification',
            'notificacao_credito': 'credit_notification',
            'notificacao_credito_diaria': 'credit_notification_daily',
            'restricao': 'restriction',
            'pin_cartao_telefonico': 'callingcard_pin',
            'prefixo_local': 'prefix_local',
            'callshop': 'callshop',
            'plano_dia': 'plan_day',
            'gravar_chamada': 'record_call',
            'ativo_paypal': 'active_paypal',
            'boleto': 'boleto',
            'dia_boleto': 'boleto_day',
            'descricao': 'description',
            'ultimo_login': 'last_login',
            'google_authenticator_ativar': 'googleAuthenticator_enable',
            'google_authenticator_chave': 'google_authenticator_key',
            'doc': 'doc',
            'id_sacado_sac': 'id_sacado_sac',
            'espaco_disco': 'disk_space',
            'limite_conta_sip': 'sipaccountlimit',
            'limite_chamada': 'calllimit',
            'cps_limite': 'cpslimit',
            'erro_limite_chamada': 'calllimit_error',
            'formato_mix_monitor': 'mix_monitor_format',
            'mostrar_preco_venda_transferencia': 'transfer_show_selling_price',
            'taxa_servico_bd_transferencia': 'transfer_bdservice_rate',
            'lucro_dbbl_rocket_transferencia': 'transfer_dbbl_rocket_profit',
            'lucro_bkash_transferencia': 'transfer_bkash_profit',
            'lucro_flexiload_transferencia': 'transfer_flexiload_profit',
            'lucro_internacional_transferencia': 'transfer_international_profit',
            'transferencia_dbbl_rocket': 'transfer_dbbl_rocket',
            'transferencia_bkash': 'transfer_bkash',
            'transferencia_flexiload': 'transfer_flexiload',
            'transferencia_internacional': 'transfer_international',
            'uso_restricao': 'restriction_use',
            'servicos_email': 'email_services',
            'email_did': 'email_did',
            'limite_chamada_entrante': 'inbound_call_limit',
            'idNomeGrupo': 'idGroupname',
            'idGrupoTipoUsuario': 'idGroupid_user_type',
            'idNomePlano': 'idPlanname',
            'idUsuarioNomeUsuario': 'idUserusername',
            'contagem_sip': 'sip_count',
            'oferta': 'offer'
        }
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
            throw new Error(`Axios error: ${error.message}`).stack;
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
            throw new Error('Usuário não encontrado.').stack;
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
            comparison: comparison
        });
    }

    interpretFilters(filterList) {
        if (filterList.length > 0) {
            filterList.forEach(filtro => {
                console.log(`Filtros recebidos: ${filtro}`);
                const [campo, operador, valor, tipo] = filtro;

                // 'usuario' -> 'username'
                const campoInterpretado = this._mappingTraducaoCampos[campo] || campo;
                // '=' -> 'eq'
                const operadorInterpretado = this._mappingSinaisOperacao[operador] || operador;

                if (!this._validSinaisOperacao.includes(operadorInterpretado)) {
                    throw new InvalidOperator(`Invalid filter operator for comparisons "${operadorInterpretado}"`).stack
                }

                // Confirmando
                console.log('Campo    : ' + campoInterpretado);
                console.log('Operador : ' + operadorInterpretado);
                console.log('Valor    : ' + valor);
                console.log('Tipo     : ' + tipo);

                // Setando, de fato, o filtro
                this.setFilter(campoInterpretado, valor, operadorInterpretado, tipo);
            });
        }
    }

    _ExpectedArgs(data, expectedArgs) {
        const missingArgs = expectedArgs.filter(arg => !(arg in data));
        if (missingArgs.length > 0) {
            throw new ExpectedArgumentMissing(`Missing arguments: ${missingArgs.join(', ')}`).stack;
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
                    this.interpretFilters(filters)
                }
                return await this.read(module);
            },
            delete: async (data) => {
                this._ExpectedArgs(data, ['id'])
                let module = 'user';
                // É importante citar que o ID esperado aqui, não é id_user. É, realmente, o ID interno do usuário. "id"
                return await this.destroy(module, data.id);
            },
            fDelete: async (filters) => {
                // smart delete, delete by filter
                let module = 'user';
                await this.clients.users.find(filters)
                    .then(ret => {
                        
                        if (!ret || !ret.count || (ret.count = 1 && !ret.rows || !ret.rows[0])) {
                            throw new Denied(`Pesquisa com o filtro "${filters}" retornou uma estrutura de dados incorreta: ${JSON.stringify(ret)}`).stack
                        } else if (ret.count != 1 ) {
                            throw new Denied(`Filtro "${filters}": ${ret.count} resultados.`).stack
                        } 

                        console.log(ret)

                        let user = ret.rows[0]
                        console.log('O id desse usuário é: ' + user.id)
                        // confirmar que existe um retorno
                        // confirmar que existe rows no retorno
                        // confirmar que só tem 1 item
                        // acessar o primeiro item
                        // pegar o id
                        // console.log(ret)
                    })
                    .catch(err => {
                        throw new Denied(`Erro na requisição`).stack
                    })
                    // propositalmente não dou catch, responsabilidade do usuário
                .finally(() => {
                    console.log('Finalização do método FIND dentro do método FDELETE.')
                })

                


                return null
                // return await this.destroy(module, data.id);
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
