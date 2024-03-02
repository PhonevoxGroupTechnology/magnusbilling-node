const axios = require('axios');

// Importante:
// "/var/www/html/mbilling/protected/controllers/DidController.php +462" > adicionar um "s" no "$value[id]"

const { isFloat } = require('./lib/Utils');
const { InvalidOperator, Denied, ValidatingError, FindError, ExpectedArgumentMisuse, ExpectedArgumentMissingArg, ExpectedArgumentTooManyArguments, ExpectedArgumentArgumentNotAllowed } = require('./lib/Errors');
const { isSet } = require('util/types');
const { clear } = require('console');

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

        this._mappingTraducaoCamposUsers = {
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

        console.log(`[${module}/${action}] Sent: ${JSON.stringify(req)}`)

        // console.log(`Sending request to ${this.public_url}/index.php/${module}/${action}`)
        // console.log(`Data: ${JSON.stringify(post_data)}`)
        // console.log(`Headers: ${JSON.stringify(headers)}`)
        // console.log(`Request: ${JSON.stringify(req)}`)

        try {
            const response = await axios.post(`${this.public_url}/index.php/${module}/${action}`, post_data, {
                headers: headers,
                httpsAgent: {
                    rejectUnauthorized: false // Para ignorar a verificação do certificado SSL
                }
            });

            console.log(`[${module}/${action}] Response: ${JSON.stringify(response.data)}`)
            return response.data;
        } catch (error) {
            console.log(`[${module}/${action}] ${JSON.stringify(error)}`)
            console.log(`[${module}/${action}] [${error.status}/${error.code}] --> ${error.config.method}:${error.config.url} [${error.config.data}]`)
            // throw new Error(`Axios error: ${error.message}`).stack;
            throw new Error(error).stack
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
        // ???? action:buy ?
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

    async findUserArguments(dataObject, args) {
        // Obtem os argumentos que o cliente passou, e trata-os como opcionais
        const notFoundKeys = [];
    
        // Extrai todas as chaves do objeto
        const dataKeys = Object.keys(dataObject);
    
        for (const key of dataKeys) {
            let found = false;
    
            // Verifica se a chave não está em args.optional
            // if (args.optional.includes(key)) {
            //     found = true;
            //     console.log('[CE] Is optional: ' + key)
            // }
            
            // Verifica se a chave não está em args.fixed
            if (args.fixed) {
                if ((key in args.fixed)) {
                    found = true;
                    console.log('[CE] User argument "' + key + '" is already a Fixed Arg')
                }
            }
            
            
            // Verifica se a chave não está em args.default[].dataArgToCheck
            if (args.default) {
                for (const defaultArg of args.default) {
                    if (defaultArg.dataArgToCheck === key || (Array.isArray(defaultArg.dataArgToCheck) && defaultArg.dataArgToCheck.includes(key))) {
                        found = true;
                        console.log('[CE] User argument "' + key + '" is already a Default Arg')
                    }
                }
            }
            
            if (!found) {
                console.log('[CE] User argument "' + key + '"')
                notFoundKeys.push(key);
            }
        }
    
        return notFoundKeys;
    }

    async interpretExpectations(dataArray, expects) {
        expects.forEach(expectation => {
            const { args, logic } = expectation;
            this._ExpectedArgs(dataArray, args, logic)
        });
    }

    async interpretPayloadArgs(payloadArgs, payload, data) {
        if (!payloadArgs) { console.log('[CE] No payload args.'); return {} }
            
        console.log('\n[CE] Adding fixeds....')
        if (payloadArgs.fixed) {
            payload = await this.addFixedArgs(payloadArgs.fixed, payload)
        } else { console.log('[CE] No fixed args found.') }
        console.log('[CE] Payload post-fixed: ' + JSON.stringify(payload))

        console.log('\n[CE] Adding defaults...')
        if (payloadArgs.default) {
            payload = await this.addDefaultArgs(payloadArgs.default, payload, data)
        } else { console.log('[CE] No default args found.') }
        console.log('[CE] Payload post-default: ' + JSON.stringify(payload) + '\n')

        console.log('\n[CE] Adding user arguments...')
        if (payloadArgs.userArguments) {
            payload = await this.addUserArgs(payloadArgs.userArguments, payload, data)
        } else { console.log('[CE] No user args found.') }
        console.log('[CE] Payload post-userArgs: ' + JSON.stringify(payload))

        return payload
    }

    async addFixedArgs(fixedArgs, payload) {
        // Adicionando a parte fixada da payload
        
        for (const [fixArg, value] of Object.entries(fixedArgs)) {
            console.log('[CE] Iterating FIXED arg: ' + fixArg)
            payload[fixArg] = value;
        }

        return payload;
    }

    async addUserArgs(userArgs, payload, data) {
        userArgs.forEach(usrArg => {
            console.log('[CE] Iterating USER ARGUMENT: ' + usrArg)
            if (data[usrArg]) {
                payload[usrArg] = data[usrArg]
            }
        })
        return payload
    }

    async addDefaultArgs(defaultArgs, payload, data) {
        const promises = []; // Array pra armazenar a desgraça das promessas que PODEM existir como default (pra pesquisa de IDs)
        defaultArgs.forEach(defArg => {
            const { payloadArgToSet, dataArgToCheck, dataArgIsPresent, dataArgIsMissing  } = defArg;
            // console.log('payload arg     : ' + payloadArgToSet)
            // console.log('comparator      : ' + dataArgToCheck)
            // console.log('value isPresent : ' + dataArgIsPresent)
            // console.log('value isMissing : ' + dataArgIsMissing)
            console.log('[CE] Iterating DEFAULT arg: ' + payloadArgToSet + ' (comp:' + dataArgToCheck + ')')
            
            if(data[dataArgToCheck]) {
                let trueValue;
                if (typeof dataArgIsPresent === 'function') {
                    // Se dataArgIsPresent for uma função, chamamos ela passando o valor de data[dataArgToCheck]
                    trueValue = dataArgIsPresent(data[dataArgToCheck]);
                } else {
                    // Se não for uma função, usamos o valor diretamente
                    trueValue = dataArgIsPresent;
                }
        
                // Adiciona a promise ao array de promessas se trueValue for uma promise
                if (trueValue instanceof Promise) {
                    promises.push(
                        trueValue
                            .then(result => {
                                payload[payloadArgToSet] = result;
                            })
                            .catch(error => {
                                console.error(error);
                                // payload[payloadArgToSet] = dataArgIsMissing;
                                throw new Error('Ao realizar sua requisição, retornou um erro. Não vou assumir o valor default!')
                            })
                    );
                } else {
                    // Se não for uma promise, usamos o valor diretamente
                    // console.log('true val: ' + trueValue)
                    // console.log('payload : ' + JSON.stringify(payload))
                    // console.log('arg     : ' + payloadArgToSet)
                    payload[payloadArgToSet] = trueValue;
                }
            } else {
                // Parâmetro não está presente, assumimos o valor padrão.
                payload[payloadArgToSet] = dataArgIsMissing;
            }
        });

        await Promise.all(promises)
            // .then(() => {
            //     console.log('[CE] Awaited Promised Payload: ');
            //     console.log(payload);
            // })
            .catch(error => {
                console.error(error);
                throw new Error("eu odeio promises")
            });

        return payload
    }
    
    

// TESTNGIN!!!!!!!!!! ///////////////////////////////////////////////////////////////////////////////////

    async createEndpoint(module, action, ArgumentObject) {
        return async (data) => {
            console.log('[CE] Data received: ');
            console.log(data);
            
            console.log('[CE] Interpreting expects...');
            if (ArgumentObject.expects) { await this.interpretExpectations(data, ArgumentObject.expects) } else { console.log('[CE] No expects found.') };

            console.log('[CE] Obtaining user arguments: ')
            ArgumentObject.payload.userArguments = await this.findUserArguments(data, ArgumentObject.payload)
            console.log(ArgumentObject.payload.userArguments)


            console.log('[CE] Building your payload structure...')
            let payload = {}
            payload = await this.interpretPayloadArgs(ArgumentObject.payload, payload, data)

            console.log('[CE] Interpreting module and action...')
            // quero, de alguma forma, colocar as ações de cada módulo em outros arquivos, pra facilitar a minha vida separando os arquivos e diminuindo o tamanho deste arquivo principal.
            // ter um arquivo, por exemplo, users.save.js, users.destroy.js
            // basicamente, esse arquivo ai que vai ter que enviar a query, ou padronizar a query o suficiente pra deixar aqui
            // payload = todos os dados interpretados pra enviar na query
            switch (action) {
                case 'save':
                case 'destroy':
                    // console.log(action)
                    payload.module = module ;   
                    payload.action = action;                    
                    break;
                case 'read':
                    console.log('read....')
                    this.interpretFilters(data.filtro)
                    let r = await this.read(module)
                    this.clearFilter()
                    return r
                default:
                    console.log('[CE] Unexpected action')
                    return null
            }

            console.log('[CE] All done! Returning your endpoint for "' + module + ':' + action + '"!')
            // return await this.query(payload)
            return payload // dev
        }
    }





    test = {
        teste: {
            new: async (data) => {
                const ArgumentObject = {
                    expects: [
                        { args: ['username','password','email'], logic: 'AND' },
                        { args: ['id_plan', 'id_plan_filtro'], logic: 'NAND' },
                        { args: ['id', 'createUser'], logic: '!OR' }
                    ],
                    payload: {
                        default: [
                            // { // Isso não precisa existir para o endpoint NEW!
                            //     dataArgToCheck: 'id_user_filtro', // Checo a presença desse argumento
                            //     payloadArgToSet: 'id_user', // Pra setar esse argumento
                            //     dataArgIsPresent: async (data_dataArgToCheck) => { // Se estiver presente, uso isso (data.dataArgToCheck)
                            //         return await this.clients.users.fGetId(data_dataArgToCheck)
                            //     },
                            //     // dataArgIsPresent: '5',
                            //     dataArgIsMissing: '0' // Se estiver ausente, uso isso
                            // },
                            {
                                dataArgToCheck: 'id_group', // Arg a consultar
                                payloadArgToSet: 'id_group', // Arg a setar
                                dataArgIsPresent: data.id_group, // Valor caso esteja presente
                                dataArgIsMissing: '3' // Default (caso esteja ausente)
                            },
                            {
                                dataArgToCheck: 'active',
                                payloadArgToSet: 'active',
                                dataArgIsPresent: data.active,
                                dataArgIsMissing: 1
                            }
                        ],                        
                        fixed: {
                            createUser: 1,
                            id: 0,
                        }
                    }   
                };
                const endpoint = await this.createEndpoint('user', 'save', ArgumentObject); // Criando o endpoint 'new'
                return await endpoint(data); // Chamando o endpoint 'new' com os dados fornecidos
            },
            find: async (data) => {
                const ArgumentObject = {
                    expects: [
                        { args: ['filtro'], logic: 'AND' },
                    ],
                    payload: { // nao preciso editar a payload em uma CONSULTA
                    }   
                };
                const endpoint = await this.createEndpoint('user', 'read', ArgumentObject); // Criando o endpoint 'new'
                return await endpoint(data); // Chamando o endpoint 'new' com os dados fornecidos
            }
        }
    };


// TESTNGIN!!!!!!!!!! ///////////////////////////////////////////////////////////////////////////////////

    clearFilter() {
        this.filter = [];
    }

    setFilter(field, value, comparison = 'st', type = 'string') {
        // console.log('inside setfilter')
        // console.log('field      : ' + field)
        // console.log('value      : ' + value)
        // console.log('comparison : ' + comparison)
        // console.log('type       : ' + type)
        this.filter.push({
            type: type,
            field: field,
            value: value,
            comparison: comparison
        });
    }

    interpretFilters(filterList) {
        if (filterList !== undefined && filterList.length > 0) {
            // console.log('filter list:' + filterList)
            filterList.forEach(filtro => {
                // console.log(`Filtros recebidos: ${filtro}`);
                let [campo, operador, valor, tipo] = filtro;

                // 'usuario' -> 'username'
                const campoInterpretado = this._mappingTraducaoCamposUsers[campo] || campo;
                // '=' -> 'eq'
                const operadorInterpretado = this._mappingSinaisOperacao[operador] || operador;

                if (!this._validSinaisOperacao.includes(operadorInterpretado)) {
                    throw new InvalidOperator(`Operador comparativo "${operadorInterpretado}" inválido. Seu filtro está correto?`).stack
                }
                
                // Confirmando
                // console.log('Campo    : ' + campoInterpretado + ' | Tipo: ' + typeof(campoInterpretado));
                // console.log('Operador : ' + operadorInterpretado + ' | Tipo: ' + typeof(operadorInterpretado));
                // console.log('Valor    : ' + valor + ' | Tipo: ' + typeof(valor));
                // console.log('Tipo     : ' + tipo + ' | Tipo: ' + typeof(tipo));

                this.setFilter(campoInterpretado, valor, operadorInterpretado, tipo);

            });
        }
    }

    validateReturn(ret) {
        if (!ret) {
            throw new ValidatingError(`Não houve retorno para a requisição`).stack
        } else if (!ret.count) {
            throw new ValidatingError(`Retorno com estrutura inesperada: ${JSON.stringify(ret)}`).stack
        } else if (ret.count >= 1 && (ret.rows != null && !ret.rows)) {
            throw new ValidatingError(`Retorno com estrutura inesperada: ${JSON.stringify(ret)}`).stack
        }
        return ret
    }

    _ExpectedArgs(data, expectedArgs, condition = "AND") {
        if (condition === "AND") {
            const missingArgs = expectedArgs.filter(arg => !(arg in data));
            if (missingArgs.length > 0) {
                throw new ExpectedArgumentMissingArg(`Argumentos faltantes: ${missingArgs.join(', ')}`).stack;
            }
        } else if (condition === "NAND") {
            const presentArgsCount = expectedArgs.filter(arg => arg in data).length;
            if (presentArgsCount === expectedArgs.length) {
                throw new ExpectedArgumentTooManyArguments(`Conflito de argumentos: ${expectedArgs.join(', ')}`).stack;
            }
        } else if (condition === "OR") {
            if (!expectedArgs.some(arg => arg in data)) {
                throw new ExpectedArgumentMissingArg(`Argumentos necessários: ${expectedArgs.join(', ')}`).stack;
            }
        } else if (condition === "!OR") { // funny moment
            if (expectedArgs.some(arg => arg in data)) {
                throw new ExpectedArgumentArgumentNotAllowed(`Argumentos não permitidos: ${expectedArgs.join(', ')}`).stack;
            }
        } else if (condition === "XOR") {
            const presentArgsCount = expectedArgs.filter(arg => arg in data).length;
            if (presentArgsCount === 0) {
                throw new ExpectedArgumentMissingArg(`Ao menos um argumento necessário: ${expectedArgs.join(', ')}`).stack;
            }
            if (!(presentArgsCount === 1)) {
                throw new ExpectedArgumentTooManyArguments(`Apenas um dos argumentos é necessário: ${expectedArgs.join(', ')}`).stack;
            }
        } else if (condition === "NOR") {
            const forbiddenArgs = expectedArgs.filter(arg => arg in data);
            if (forbiddenArgs.length > 0) {
                throw new ExpectedArgumentArgumentNotAllowed(`Argumentos não permitidos: ${forbiddenArgs.join(', ')}`).stack;
            }
        } else {
            throw new ExpectedArgumentMisuse(`Condição inválida: ${condition}. Condição precisa ser "AND" ou "OR".`).stack;
        }
    }

    opcional(chave, valor) {
        return valor !== undefined ? { [chave]: valor } : {};
    }

    // API Simplificada
    clients = {
        users: { // DONE
            new: async (data) => {
                /**
                 * Cria um novo usuário com os dados fornecidos.
                 * @param {Object} data - Os dados do usuário a serem criados.
                 * @param {string} data.usuario - O nome de usuário do novo usuário (obrigatório).
                 * @param {string} data.senha - A senha do novo usuário (obrigatório).
                 * @param {string} data.email - O endereço de e-mail do novo usuário (obrigatório).
                 * @param {number} data.ativo - O status de ativação do usuário (opcional, padrão: 1).
                 * @param {number} data.id_grupo - O ID do grupo do usuário (opcional, padrão: 3).
                 * @param {string} data.primeiro_nome - O primeiro nome do usuário (opcional).
                 * @param {string} data.ultimo_nome - O sobrenome do usuário (opcional).
                 * @param {number} data.id_plano - O ID do plano do usuário (opcional).
                 * @param {number} data.credito - O crédito do usuário (opcional).
                 * @param {number} data.limite_chamadas - O limite de chamadas do usuário (opcional).
                 * @returns {Promise} - Uma Promise que resolve com o resultado da consulta ao banco de dados.
                 * @throws {Error} - Se os argumentos obrigatórios não forem fornecidos (usuario, senha, email).
                */
                this._ExpectedArgs(data, ['usuario', 'senha', 'email'], "AND")
                let payload = {
                    createUser: 1, // Fixo
                    id: 0, // Fixo
                    username: data.usuario, // Obrigatório
                    password: data.senha, // Obrigatório
                    email: data.email, // Obrigatório
                    active: data.ativo ?? 1, // Default: ativo (pois estou CRIANDO um usuário)
                    id_group: data.id_grupo ?? 3, // Default: Cliente
                    ...this.opcional('prefix_local', data.prefix_local), // teste
                    ...this.opcional('firstname', data.primeiro_nome), // Opcional
                    ...this.opcional('lastname', data.ultimo_nome), // Opcional
                    ...this.opcional('id_plan', data.id_plano), // Opcional
                    ...this.opcional('credit', data.credito), // Opcional
                    ...this.opcional('calllimit', data.limite_chamadas), // Opcional
                }
                return await this.query(payload);
            },
            find: async (filters) => {
                /**
                 * Encontra usuários com base nos filtros fornecidos.
                 * Caso não seja repassado um filtro, obtém TODOS os "clients.users" do sistema.
                 * @param {Object} filters - Os filtros para a consulta (opcional).
                 * @returns {Promise} - Uma Promise que resolve com os resultados da consulta ao banco de dados.
                */
                let module = 'user';
                this.interpretFilters(filters);
                let r = await this.read(module);

                this.clearFilter()
                return r
            },
            delete: async (data) => {
                /**
                 * Exclui um usuário com base no ID fornecido ou no filtro especificado.
                 * @param {Object} data - Os dados necessários para excluir o usuário.
                 * @param {number} data.id - O ID do usuário a ser excluído (ou 0 se nenhum ID for fornecido).
                 * @param {string} data.filtro - O filtro para encontrar o usuário a ser excluído (opcional).
                 * @returns {Promise} - Uma Promise que resolve com o resultado da exclusão do usuário.
                 * @throws {Error} - Se ambos id e filtro forem fornecidos, ou se nenhum deles for fornecido.
                */
                this._ExpectedArgs(data, ['id', 'id_filtro'], "XOR");
                data.id = data.id_filtro ? await this.clients.users.fGetId(data.id_filtro) : data.id; // Se passou filtro, uso. Se não, uso ID. Garanto que não tem ambos através do ExpectedArgs:XOR

                let module = 'user';
                return await this.destroy(module, data.id); // Lembrando, o ID esperado aqui é o ID interno, e não o número do usuario!
            },
            edit: async (data) => {
                /**
                 * Edita um usuário com base no ID fornecido ou no filtro especificado.
                 * @param {Object} data - Os dados do usuário a serem editados.
                 * @param {number} data.id - O ID do usuário a ser editado (ou 0 se nenhum ID for fornecido).
                 * @param {string} data.filtro - O filtro para encontrar o usuário a ser editado (opcional).
                 * @param {string} data.usuario - O novo nome de usuário (opcional).
                 * @param {string} data.senha - A nova senha (opcional).
                 * @param {string} data.email - O novo endereço de e-mail (opcional).
                 * @param {string} data.primeiro_nome - O novo primeiro nome (opcional).
                 * @param {string} data.ultimo_nome - O novo sobrenome (opcional).
                 * @param {number} data.id_plano - O novo ID do plano (opcional).
                 * @param {number} data.credito - O novo crédito (opcional).
                 * @param {number} data.limite_chamadas - O novo limite de chamadas (opcional).
                 * @returns {Promise} - Uma Promise que resolve com o resultado da edição do usuário.
                 * @throws {Error} - Se ambos id e filtro forem fornecidos, ou se nenhum deles for fornecido.
                */
                this._ExpectedArgs(data, ['id', 'id_filtro'], "XOR");
                data.id = data.id_filtro ? await this.clients.users.fGetId(data.id_filtro) : data.id; // Se passou filtro, uso. Se não, uso ID. Garanto que não tem ambos através do ExpectedArgs:XOR

                let module = 'user';
                let action = 'save';
                let payload = {
                    module: module,
                    action: action,
                    id: data.id,
                    ...this.opcional('username', data.usuario), // Opcional
                    ...this.opcional('password', data.senha), // Opcional
                    ...this.opcional('email', data.email), // Opcional
                    ...this.opcional('firstname', data.primeiro_nome), // Opcional
                    ...this.opcional('lastname', data.ultimo_nome), // Opcional
                    ...this.opcional('id_plan', data.id_plano), // Opcional
                    ...this.opcional('credit', data.credito), // Opcional
                    ...this.opcional('calllimit', data.limite_chamadas), // Opcional
                }
                return await this.query(payload);
            },
            fGetId: async (filters) => {
                /**
                 * Obtém o ID de um usuário com base nos filtros fornecidos.
                 * @param {Object} filters - Os filtros para encontrar o usuário.
                 * @returns {number} - O ID do usuário encontrado.
                 * @throws {FindError} - Se houver um erro ao encontrar o usuário.
                */
                try {
                    const ret = await this.clients.users.find(filters);
                    this.validateReturn(ret);

                    if (parseInt(ret.count) !== 1) {
                        throw (`Filtro "${filters}": ${ret.count} resultados.`);
                    } else {
                        const user = ret.rows[0];
                        // console.log(`---> O ID desse usuário é: ${user.id}`);
                        return user.id;
                    }
                } catch (err) {
                    throw new FindError(`${err}`).stack;
                }
            }
        },
        sipUsers: { // DONE
            new: async (data) => {
                this._ExpectedArgs(data, ['defaultuser', 'secret'], "AND")
                this._ExpectedArgs(data, ['id_user', 'id_user_filtro'], "XOR")

                let module = 'sip'
                let action = 'save'
                let payload = {
                    module: module, // Obrigatório
                    action: action, // Obrigatório
                    id: 0,          // Obrigatório
                    id_user: data.id_user_filtro ? await this.clients.users.fGetId(data.id_user_filtro) : data.id_user, // Obrigatório, input
                    defaultuser: data.defaultuser,              // Obrigatório, input
                    secret: data.secret,                        // Obrigatório, input
                    name: data.name ?? '',                      // Obrigatório
                    callerid: data.callerid ?? '',              // Obrigatório
                    disallow: data.disallow ?? 'all',           // Valor padrão
                    allow: data.allow ?? 'g729,gsm,ulaw,alaw',  // Valor padrão
                    host: data.host ?? 'dynamic',               // Valor padrão
                    ...this.opcional('directmedia', data.directmedia),
                    ...this.opcional('context', data.context),
                    ...this.opcional('dtmfmode', data.dtmfmode),
                    ...this.opcional('insecure', data.insecure),
                    ...this.opcional('nat', data.nat),
                    ...this.opcional('qualify', data.qualify),
                    ...this.opcional('type', data.type),
                    ...this.opcional('regseconds', data.regseconds),
                    ...this.opcional('allowtransfer', data.allowtransfer),
                    ...this.opcional('calllimit', data.calllimit),
                    ...this.opcional('ringfalse', data.ringfalse),
                    ...this.opcional('record_call', data.record_call),
                    ...this.opcional('voicemail', data.voicemail),
                    ...this.opcional('dial_timeout', data.dial_timeout),
                    ...this.opcional('techprefix', data.techprefix),
                    ...this.opcional('amd', data.amd),
                    ...this.opcional('id_trunk_group', data.id_trunk_group),
                    ...this.opcional('videosupport', data.videosupport),
                    ...this.opcional('voicemail_password', data.voicemail_password),
                    ...this.opcional('id_user', data.id_user),
                    ...this.opcional('name', data.name),
                    ...this.opcional('accountcode', data.accountcode),
                    ...this.opcional('regexten', data.regexten),
                    ...this.opcional('amaflags', data.amaflags),
                    ...this.opcional('callgroup', data.callgroup),
                    ...this.opcional('callerid', data.callerid),
                    ...this.opcional('DEFAULTip', data.defaultip),
                    ...this.opcional('fromuser', data.fromuser),
                    ...this.opcional('fromdomain', data.fromdomain),
                    ...this.opcional('sip_group', data.sip_group),
                    ...this.opcional('language', data.language),
                    ...this.opcional('mailbox', data.mailbox),
                    ...this.opcional('md5secret', data.md5secret),
                    ...this.opcional('deny', data.deny),
                    ...this.opcional('permit', data.permit),
                    ...this.opcional('pickupgroup', data.pickupgroup),
                    ...this.opcional('port', data.port),
                    ...this.opcional('rtptimeout', data.rtptimeout),
                    ...this.opcional('rtpholdtimeout', data.rtpholdtimeout),
                    ...this.opcional('ipaddr', data.ipaddr),
                    ...this.opcional('fullcontact', data.fullcontact),
                    ...this.opcional('setvar', data.setvar),
                    ...this.opcional('regserver', data.regserver),
                    ...this.opcional('lastms', data.lastms),
                    ...this.opcional('auth', data.auth),
                    ...this.opcional('subscribemwi', data.subscribemwi),
                    ...this.opcional('vmexten', data.vmexten),
                    ...this.opcional('cid_number', data.cid_number),
                    ...this.opcional('callingpres', data.callingpres),
                    ...this.opcional('usereqphone', data.usereqphone),
                    ...this.opcional('mohsuggest', data.mohsuggest),
                    ...this.opcional('autoframing', data.autoframing),
                    ...this.opcional('maxcallbitrate', data.maxcallbitrate),
                    ...this.opcional('outboundproxy', data.outboundproxy),
                    ...this.opcional('rtpkeepalive', data.rtpkeepalive),
                    ...this.opcional('useragent', data.useragent),
                    ...this.opcional('lineStatus', data.lineStatus),
                    ...this.opcional('url_events', data.url_events),
                    ...this.opcional('forward', data.forward),
                    ...this.opcional('block_call_reg', data.block_call_reg),
                    ...this.opcional('alias', data.alias),
                    ...this.opcional('description', data.description),
                    ...this.opcional('addparameter', data.addparameter),
                    ...this.opcional('cnl', data.cnl),
                    ...this.opcional('type_forward', data.type_forward),
                    ...this.opcional('id_ivr', data.id_ivr),
                    ...this.opcional('id_queue', data.id_queue),
                    ...this.opcional('id_sip', data.id_sip),
                    ...this.opcional('extension', data.extension),
                    ...this.opcional('voicemail_email', data.voicemail_email),
                    ...this.opcional('sip_config', data.sip_config),
                    ...this.opcional('sipshowpeer', data.sipshowpeer)
                };

                if (!data.dry) { return await this.query(payload) } else { return 'Dry finished' }
            },
            edit: async (data) => {
                this._ExpectedArgs(data, ['id', 'id_filtro'], "XOR");
                data.id = data.id_filtro ? await this.clients.sipUsers.fGetId(data.id_filtro) : data.id;

                let module = 'sip';
                let action = 'save';
                let payload = {
                    module: module,
                    action: action,
                    id: data.id,
                    ...this.opcional("id_user", data.id_user_filtro ? await this.clients.users.fGetId(data.id_user_filtro) : data.id_user),
                    ...this.opcional('defaultuser', data.defaultuser),
                    ...this.opcional('secret', data.secret),
                    ...this.opcional('name', data.name),
                    ...this.opcional('callerid', data.callerid),
                    ...this.opcional('disallow', data.disallow),
                    ...this.opcional('allow', data.allow),
                    ...this.opcional('host', data.host),
                    ...this.opcional('directmedia', data.directmedia),
                    ...this.opcional('context', data.context),
                    ...this.opcional('dtmfmode', data.dtmfmode),
                    ...this.opcional('insecure', data.insecure),
                    ...this.opcional('nat', data.nat),
                    ...this.opcional('qualify', data.qualify),
                    ...this.opcional('type', data.type),
                    ...this.opcional('regseconds', data.regseconds),
                    ...this.opcional('allowtransfer', data.allowtransfer),
                    ...this.opcional('calllimit', data.calllimit),
                    ...this.opcional('ringfalse', data.ringfalse),
                    ...this.opcional('record_call', data.record_call),
                    ...this.opcional('voicemail', data.voicemail),
                    ...this.opcional('dial_timeout', data.dial_timeout),
                    ...this.opcional('techprefix', data.techprefix),
                    ...this.opcional('amd', data.amd),
                    ...this.opcional('id_trunk_group', data.id_trunk_group),
                    ...this.opcional('videosupport', data.videosupport),
                    ...this.opcional('voicemail_password', data.voicemail_password),
                    ...this.opcional('id_user', data.id_user),
                    ...this.opcional('name', data.name),
                    ...this.opcional('accountcode', data.accountcode),
                    ...this.opcional('regexten', data.regexten),
                    ...this.opcional('amaflags', data.amaflags),
                    ...this.opcional('callgroup', data.callgroup),
                    ...this.opcional('callerid', data.callerid),
                    ...this.opcional('DEFAULTip', data.defaultip),
                    ...this.opcional('fromuser', data.fromuser),
                    ...this.opcional('fromdomain', data.fromdomain),
                    ...this.opcional('sip_group', data.sip_group),
                    ...this.opcional('language', data.language),
                    ...this.opcional('mailbox', data.mailbox),
                    ...this.opcional('md5secret', data.md5secret),
                    ...this.opcional('deny', data.deny),
                    ...this.opcional('permit', data.permit),
                    ...this.opcional('pickupgroup', data.pickupgroup),
                    ...this.opcional('port', data.port),
                    ...this.opcional('rtptimeout', data.rtptimeout),
                    ...this.opcional('rtpholdtimeout', data.rtpholdtimeout),
                    ...this.opcional('ipaddr', data.ipaddr),
                    ...this.opcional('fullcontact', data.fullcontact),
                    ...this.opcional('setvar', data.setvar),
                    ...this.opcional('regserver', data.regserver),
                    ...this.opcional('lastms', data.lastms),
                    ...this.opcional('auth', data.auth),
                    ...this.opcional('subscribemwi', data.subscribemwi),
                    ...this.opcional('vmexten', data.vmexten),
                    ...this.opcional('cid_number', data.cid_number),
                    ...this.opcional('callingpres', data.callingpres),
                    ...this.opcional('usereqphone', data.usereqphone),
                    ...this.opcional('mohsuggest', data.mohsuggest),
                    ...this.opcional('autoframing', data.autoframing),
                    ...this.opcional('maxcallbitrate', data.maxcallbitrate),
                    ...this.opcional('outboundproxy', data.outboundproxy),
                    ...this.opcional('rtpkeepalive', data.rtpkeepalive),
                    ...this.opcional('useragent', data.useragent),
                    ...this.opcional('lineStatus', data.lineStatus),
                    ...this.opcional('url_events', data.url_events),
                    ...this.opcional('forward', data.forward),
                    ...this.opcional('block_call_reg', data.block_call_reg),
                    ...this.opcional('alias', data.alias),
                    ...this.opcional('description', data.description),
                    ...this.opcional('addparameter', data.addparameter),
                    ...this.opcional('cnl', data.cnl),
                    ...this.opcional('type_forward', data.type_forward),
                    ...this.opcional('id_ivr', data.id_ivr),
                    ...this.opcional('id_queue', data.id_queue),
                    ...this.opcional('id_sip', data.id_sip),
                    ...this.opcional('extension', data.extension),
                    ...this.opcional('voicemail_email', data.voicemail_email),
                    ...this.opcional('sip_config', data.sip_config),
                    ...this.opcional('sipshowpeer', data.sipshowpeer)
                    /*
                    campos opcionais de sipUsers aqui
                    */
                }

                return await this.query(payload)
            },
            delete: async (data) => {
                this._ExpectedArgs(data, ['id', 'id_filtro'], "XOR")
                data.id = data.id_filtro ? await this.clients.sipUsers.fGetId(data.id_filtro) : data.id;

                let module = 'sip';
                return await this.destroy(module, data.id)
            },
            find: async (filters) => {
                let module = 'sip'
                this.interpretFilters(filters);
                let r = await this.read(module);

                this.clearFilter()
                return r
            },
            fGetId: async (filters) => {
                try {
                    const ret = await this.clients.sipUsers.find(filters);
                    this.validateReturn(ret);

                    if (parseInt(ret.count) !== 1) {
                        throw (`Filtro "${filters}": ${ret.count} resultados.`);
                    } else {
                        const sipUser = ret.rows[0];
                        console.log(`fGetId --> ${sipUser.id}`);
                        return sipUser.id;
                    }
                } catch (err) {
                    throw new FindError(`${err}`).stack;
                }
            }
        }
    };

    billing = { // DONE
        refills: { // DONE
            new: async (data) => { // DONE
                this._ExpectedArgs(data, ['credit'], "AND")
                this._ExpectedArgs(data, ['id_user', 'id_user_filtro'], "XOR")

                if (!isFloat(data.credit)) { throw new Error('O tipo de "credit" precisa ser um valor de ponto flutuante (float)!')}

                if (!data.id) { data.description = "Recharge via API" } // Mensagem padrão na criação de um refill

                let module = 'refill'
                let action = 'save'
                let payload = {
                    module: module,
                    action: action,
                    id: data.id ?? 0, // 0 para a criação de um novo 
                    payment: data.payment ?? 1, // geralmente isso aqui nao muda, somente pra controle interno
                    ...this.opcional("id_user", data.id_user_filtro ? await this.clients.users.fGetId(data.id_user_filtro) : data.id_user), // Quem receberá a recarga
                    credit: data.credit, // Precisa ser um float. Talvez funcione com string formatada igual um float
                    ...this.opcional("date", data.date), // YYYY-MM-DD HH-mm-SS, automaticamente preenchido se ausente
                    ...this.opcional("description", data.description),
                    ...this.opcional("invoice_number", data.invoice_number), // Não sei
                    ...this.opcional("image", data.image) // Comprovante de pagamento
                }

                if (!data.dry) { return await this.query(payload) } else { return 'Dry finished' }

            },
            edit: async (data) => { // DONE
                this._ExpectedArgs(data, ['id', 'id_filtro'], "XOR");
                data.id = data.id_filtro ? await this.billing.refills.fGetId(data.id_filtro) : data.id;

                if (data.credit && !isFloat(data.credit)) { throw new Error('O tipo de "credit" precisa ser um valor de ponto flutuante (float)!') }

                let module = 'refill';
                let action = 'save';
                let payload = {
                    module: module,
                    action: action,
                    id: data.id,
                    ...this.opcional("id_user", data.id_user_filtro ? await this.clients.users.fGetId(data.id_user_filtro) : data.id_user),
                    ...this.opcional("credit", data.credit),
                    ...this.opcional("payment", data.payment),
                    ...this.opcional("date", data.date), // YYYY-MM-DD HH-mm-SS, automaticamente preenchido se ausente
                    ...this.opcional("description", data.description),
                    ...this.opcional("invoice_number", data.invoice_number), // Não sei
                    ...this.opcional("image", data.image) // Comprovante de pagamento
                }

                if (!data.dry) { return await this.query(payload) } else { return 'Dry finished' }
                //
            },
            delete: async (data) => {
                this._ExpectedArgs(data, ['id', 'id_filtro'], "XOR");
                data.id = data.id_filtro ? await this.billing.refills.fGetId(data.id_filtro) : data.id; // Se passou filtro, uso. Se não, uso ID. Garanto que não tem ambos através do ExpectedArgs:XOR

                let module = 'refill';
                return await this.destroy(module, data.id); // Lembrando, o ID esperado aqui é o ID interno, e não o número do usuario!
            },
            find: async (filters) => { // DONE
                let module = 'refill';
                this.interpretFilters(filters);
                let r = await this.read(module);

                this.clearFilter()
                return r
            },
            fGetId: async (filters) => { // DONE
                try {
                    const ret = await this.billing.refills.find(filters);
                    this.validateReturn(ret);

                    if (parseInt(ret.count) !== 1) {
                        throw (`Filtro "${filters}": ${ret.count} resultados.`);
                    } else {
                        const refill = ret.rows[0];
                        console.log(`fGetId --> ${refill.id}`);
                        return refill.id;
                    }
                } catch (err) {
                    throw new FindError(`${err}`).stack;
                }
            }
        }
    }

    dids = { // DONE
        dids: { // DONE
            new: async (data) => {
                // base
                let module = 'did'
                let action = 'save'

                this._ExpectedArgs(data, ['did'], "AND");
                this._ExpectedArgs(data, ['id_user', 'id_user_filtro'], "NAND");

                let payload = {
                    module: module, // Obrigatório
                    action: action, // Obrigatório
                    id: 0,          // Obrigatório
                    did: data.did,  // Obrigatório, input
                    id_user: data.id_user ?? await this.clients.users.fGetId(data.id_user_filtro) ?? 0, 
                    ...this.opcional("country", data.country),
                    ...this.opcional("record_call", data.record_call),
                    ...this.opcional("activated", data.activated),
                    ...this.opcional("callerid", data.callerid),
                    ...this.opcional("connection_charge", data.connection_charge),
                    ...this.opcional("fixrate", data.fixrate),
                    ...this.opcional("connection_sell", data.connection_sell),
                    ...this.opcional("minimal_time_buy", data.minimal_time_buy),
                    ...this.opcional("buyrateinitblock", data.buyrateinitblock),
                    ...this.opcional("buyrateincrement", data.buyrateincrement),
                    ...this.opcional("minimal_time_charge", data.minimal_time_charge),
                    ...this.opcional("initblock", data.initblock),
                    ...this.opcional("increment", data.increment),
                    ...this.opcional("charge_of", data.charge_of),
                    ...this.opcional("calllimit", data.calllimit),
                    ...this.opcional("id_server", data.id_server),
                    ...this.opcional("description", data.description),
                    ...this.opcional("expression_1", data.expression_1),
                    ...this.opcional("buy_rate_1", data.buy_rate_1),
                    ...this.opcional("selling_rate_1", data.selling_rate_1),
                    ...this.opcional("agent_client_rate_1", data.agent_client_rate_1),
                    ...this.opcional("block_expression_1", data.block_expression_1),
                    ...this.opcional("send_to_callback_1", data.send_to_callback_1),
                    ...this.opcional("expression_2", data.expression_2),
                    ...this.opcional("buy_rate_2", data.buy_rate_2),
                    ...this.opcional("selling_rate_2", data.selling_rate_2),
                    ...this.opcional("agent_client_rate_2", data.agent_client_rate_2),
                    ...this.opcional("block_expression_2", data.block_expression_2),
                    ...this.opcional("send_to_callback_2", data.send_to_callback_2),
                    ...this.opcional("expression_3", data.expression_3),
                    ...this.opcional("buy_rate_3", data.buy_rate_3),
                    ...this.opcional("selling_rate_3", data.selling_rate_3),
                    ...this.opcional("agent_client_rate_3", data.agent_client_rate_3),
                    ...this.opcional("block_expression_3", data.block_expression_3),
                    ...this.opcional("send_to_callback_3", data.send_to_callback_3),
                    ...this.opcional("cbr", data.cbr),
                    ...this.opcional("cbr_ua", data.cbr_ua),
                    ...this.opcional("cbr_total_try", data.cbr_total_try),
                    ...this.opcional("cbr_time_try", data.cbr_time_try),
                    ...this.opcional("cbr_em", data.cbr_em),
                    ...this.opcional("TimeOfDay_monFri", data.TimeOfDay_monFri),
                    ...this.opcional("TimeOfDay_sat", data.TimeOfDay_sat),
                    ...this.opcional("TimeOfDay_sun", data.TimeOfDay_sun),
                    ...this.opcional("workaudio", data.workaudio),
                    ...this.opcional("noworkaudio", data.noworkaudio),
                }

                if (!data.dry) { return await this.query(payload) } else { return 'Dry finished' }

            },
            edit: async (data) => {
                this._ExpectedArgs(data, ['id', 'id_filtro'], "XOR")
                data.id = data.id_filtro ? await this.dids.dids.fGetId(data.id_filtro) : data.id;

                let module = 'did';
                let action = 'save';
                let payload = {
                    module: module,
                    action: action,
                    id: data.id,
                    ...this.opcional('did', data.did),
                    ...this.opcional("country", data.country),
                    ...this.opcional("record_call", data.record_call),
                    ...this.opcional("activated", data.activated),
                    ...this.opcional("callerid", data.callerid),
                    ...this.opcional("connection_charge", data.connection_charge),
                    ...this.opcional("fixrate", data.fixrate),
                    ...this.opcional("connection_sell", data.connection_sell),
                    ...this.opcional("minimal_time_buy", data.minimal_time_buy),
                    ...this.opcional("buyrateinitblock", data.buyrateinitblock),
                    ...this.opcional("buyrateincrement", data.buyrateincrement),
                    ...this.opcional("minimal_time_charge", data.minimal_time_charge),
                    ...this.opcional("initblock", data.initblock),
                    ...this.opcional("increment", data.increment),
                    ...this.opcional("charge_of", data.charge_of),
                    ...this.opcional("calllimit", data.calllimit),
                    ...this.opcional("id_server", data.id_server),
                    ...this.opcional("description", data.description),
                    ...this.opcional("expression_1", data.expression_1),
                    ...this.opcional("buy_rate_1", data.buy_rate_1),
                    ...this.opcional("selling_rate_1", data.selling_rate_1),
                    ...this.opcional("agent_client_rate_1", data.agent_client_rate_1),
                    ...this.opcional("block_expression_1", data.block_expression_1),
                    ...this.opcional("send_to_callback_1", data.send_to_callback_1),
                    ...this.opcional("expression_2", data.expression_2),
                    ...this.opcional("buy_rate_2", data.buy_rate_2),
                    ...this.opcional("selling_rate_2", data.selling_rate_2),
                    ...this.opcional("agent_client_rate_2", data.agent_client_rate_2),
                    ...this.opcional("block_expression_2", data.block_expression_2),
                    ...this.opcional("send_to_callback_2", data.send_to_callback_2),
                    ...this.opcional("expression_3", data.expression_3),
                    ...this.opcional("buy_rate_3", data.buy_rate_3),
                    ...this.opcional("selling_rate_3", data.selling_rate_3),
                    ...this.opcional("agent_client_rate_3", data.agent_client_rate_3),
                    ...this.opcional("block_expression_3", data.block_expression_3),
                    ...this.opcional("send_to_callback_3", data.send_to_callback_3),
                    ...this.opcional("cbr", data.cbr),
                    ...this.opcional("cbr_ua", data.cbr_ua),
                    ...this.opcional("cbr_total_try", data.cbr_total_try),
                    ...this.opcional("cbr_time_try", data.cbr_time_try),
                    ...this.opcional("cbr_em", data.cbr_em),
                    ...this.opcional("TimeOfDay_monFri", data.TimeOfDay_monFri),
                    ...this.opcional("TimeOfDay_sat", data.TimeOfDay_sat),
                    ...this.opcional("TimeOfDay_sun", data.TimeOfDay_sun),
                    ...this.opcional("workaudio", data.workaudio),
                    ...this.opcional("noworkaudio", data.noworkaudio),
                }

                if (!data.dry) { return await this.query(payload) } else { return 'Dry finished' }
            },
            delete: async (data) => {
                this._ExpectedArgs(data, ['id', 'id_filtro'], "XOR")
                data.id = data.id_filtro ? await this.dids.dids.fGetId(data.id_filtro) : data.id;

                let module = 'did';
                let action = 'destroy';
                let payload = {
                    module: module,
                    action: action,
                    id: data.id,
                    id_user: '0',
                }
                
                if (!data.dry) { return await this.query(payload) } else { return 'Dry finished' }
            },
            find: async (filters) => {
                let module = 'did'
                this.interpretFilters(filters);
                let r = await this.read(module);

                this.clearFilter()
                return r
            },
            fGetId: async (filters) => {
                try {
                    const ret = await this.dids.dids.find(filters);
                    this.validateReturn(ret);

                    if (parseInt(ret.count) !== 1) {
                        throw (`Filtro "${filters}": ${ret.count} resultados.`);
                    } else {
                        const dids = ret.rows[0];
                        console.log(`fGetId --> ${dids.id}`);
                        return dids.id;
                    }
                } catch (err) {
                    throw new FindError(`${err}`).stack;
                }                
            }
        },
        didDestination: { // DONE
            new: async (data) => {
                this._ExpectedArgs(data, ["type"], "AND")
                this._ExpectedArgs(data, ["id_user", "id_user_filtro"], "XOR")
                this._ExpectedArgs(data, ["id_did", "id_did_filtro"], "XOR")

                switch (data.type.toLowerCase()) {
                    case 'call_to_pstn':
                    case 'pstn':
                        this._ExpectedArgs(data, ['destination'], "AND") // obrigatório
                        this._ExpectedArgs(data, ['id_sip', 'context', 'id_ivr', 'id_queue', 'context'], "NOR") // não pode
                        data.voip_call = 0 // Isso é necessário para setar o tipo para PSTN.
                        break;
                    case 'sip':
                        //
                        this._ExpectedArgs(data, ['id_sip'], "AND")    // obrigatório
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'context', 'id_ivr', 'id_queue', 'context'], "NOR") // não pode
                        data.voip_call = 1
                        break;
                    case 'ivr':
                        //
                        this._ExpectedArgs(data, ['id_ivr'], "AND")
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'id_sip', 'context', 'id_queue', 'context'], "NOR") // não pode
                        data.voip_call = 2
                        break;
                    case 'callingcard':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 3
                        break;
                    case 'direct_extension':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 4
                        break;
                    case 'cid_callback':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 5
                        break;
                    case '0800_callback':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 6
                        break;
                    case 'queue':
                        //
                        this._ExpectedArgs(data, ['id_queue'], "AND") // obrigatório
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'id_sip', 'context', 'id_ivr', 'context'], "NOR") // não pode
                        data.voip_call = 7
                        break;
                    case 'sip_group':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 8
                        break;
                    case 'custom':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 9
                        break;
                    case 'context':
                        this._ExpectedArgs(data, ['context'], "AND")
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'id_sip', 'id_ivr', 'id_queue'], "NOR") // não pode
                        data.voip_call = 10
                        break;
                    case 'multiple_ips':
                        this._ExpectedArgs(data, ['id_sip'], "AND")    // obrigatório
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'context', 'id_ivr', 'id_queue', 'context'], "NOR") // não pode
                        data.voip_call = 11
                        break;
                    default:
                        break;
                }

                let module = 'diddestination'
                let action = 'save'

                let payload = {
                    module: module,                             // Obrigatório
                    action: action,                             // Obrigatório
                    id: data.id ?? 0,                           // Obrigatório, 0 para criação, um ID específico para edição.
                    id_did : data.id_did_filtro ? await this.dids.dids.fGetId(data.id_did_filtro) : data.id_did, // Obrigatório, input
                    id_user: data.id_user_filtro ? await this.clients.users.fGetId(data.id_user_filtro) : data.id_user, // Obrigatório, input 
                    destination: data.destination ?? "",        // Obrigatóriamente vazio, pode alterar dependendo do Tipo
                    voip_call: data.voip_call ?? 1,             // Dependente do Tipo
                    priority: data.priority ?? 1,               // Default
                    ...this.opcional("context", data.context),
                    ...this.opcional("id_sip", data.id_sip),
                    ...this.opcional("id_ivr", data.id_ivr),
                }

                if (!data.dry) { return await this.query(payload) } else { return 'Dry finished' }

            },
            edit: async (data) => {
                this._ExpectedArgs(data, ['id', 'id_filtro'], "XOR") // Obrigatório
                this._ExpectedArgs(data, ["id_user", "id_user_filtro"], "NAND") // Opcional, mas não ambos
                this._ExpectedArgs(data, ["id_did", "id_did_filtro"], "NAND") // Opcional, mas não ambos
                data.id = data.id_filtro ? await this.dids.didDestination.fGetId(data.id_filtro) : data.id;
                
                switch (data.type.toLowerCase()) {
                    case 'call_to_pstn':
                    case 'pstn':
                        this._ExpectedArgs(data, ['destination'], "AND") // obrigatório
                        this._ExpectedArgs(data, ['id_sip', 'context', 'id_ivr', 'id_queue', 'context'], "NOR") // não pode
                        data.voip_call = 0 // Isso é necessário para setar o tipo para PSTN.
                        break;
                    case 'sip':
                        //
                        this._ExpectedArgs(data, ['id_sip'], "AND")    // obrigatório
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'context', 'id_ivr', 'id_queue', 'context'], "NOR") // não pode
                        data.voip_call = 1
                        break;
                    case 'ivr':
                        //
                        this._ExpectedArgs(data, ['id_ivr'], "AND")
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'id_sip', 'context', 'id_queue', 'context'], "NOR") // não pode
                        data.voip_call = 2
                        break;
                    case 'callingcard':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 3
                        break;
                    case 'direct_extension':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 4
                        break;
                    case 'cid_callback':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 5
                        break;
                    case '0800_callback':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 6
                        break;
                    case 'queue':
                        //
                        this._ExpectedArgs(data, ['id_queue'], "AND") // obrigatório
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'id_sip', 'context', 'id_ivr', 'context'], "NOR") // não pode
                        data.voip_call = 7
                        break;
                    case 'sip_group':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 8
                        break;
                    case 'custom':
                        throw new Error('Esse tipo ainda não está implementado! :)')
                        data.voip_call = 9
                        break;
                    case 'context':
                        this._ExpectedArgs(data, ['context'], "AND")
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'id_sip', 'id_ivr', 'id_queue'], "NOR") // não pode
                        data.voip_call = 10
                        break;
                    case 'multiple_ips':
                        this._ExpectedArgs(data, ['id_sip'], "AND")    // obrigatório
                        this._ExpectedArgs(data, ['voip_call', 'destination', 'context', 'id_ivr', 'id_queue', 'context'], "NOR") // não pode
                        data.voip_call = 11
                        break;
                    default:
                        break;
                }

                let module = 'diddestination';
                let action = 'save';
                let payload = {
                module: module,                                         // Obrigatório
                    action: action,                                     // Obrigatório
                    id: data.id, 
                    ...this.opcional("id_did", data.id_did_filtro ? await this.dids.dids.fGetId(data.id_did_filtro) : data.id_did), // Obrigatório, input
                    ...this.opcional("id_user", data.id_user_filtro ? await this.clients.users.fGetId(data.id_user_filtro) : data.id_user), // Obrigatório, input 
                    ...this.opcional("destination", data.destination),
                    ...this.opcional("voip_call", data.voip_call),
                    ...this.opcional("priority", data.priority),
                    ...this.opcional("context", data.context),
                    ...this.opcional("id_sip", data.id_sip),
                    ...this.opcional("id_ivr", data.id_ivr),
                }

                return await this.query(payload)
            },
            delete: async (data) => {
                this._ExpectedArgs(data, ['id', 'filtro'], "XOR")
                data.id = data.filtro ? await this.dids.didDestination.fGetId(data.filtro) : data.id;

                let module = 'diddestination';
                let action = 'destroy';
                return await this.query({
                    module: module,
                    action: action,
                    id: data.id,
                });
            },
            find: async (filters) => {
                let module = 'diddestination'
                this.interpretFilters(filters);
                let r = await this.read(module);

                this.clearFilter()
                return r
            },
            fGetId: async (filters) => {
                try {
                    const ret = await this.dids.didDestination.find(filters);
                    this.validateReturn(ret);

                    if (parseInt(ret.count) !== 1) {
                        throw (`Filtro "${filters}": ${ret.count} resultados.`);
                    } else {
                        const didDestinations = ret.rows[0];
                        console.log(`fGetId --> ${didDestinations.id}`);
                        return didDestinations.id;
                    }
                } catch (err) {
                    throw new FindError(`${err}`).stack;
                }   
            }
        }
    };

    rates = { // TO-DO
        plans: { // TO-DO
            new: async (data) => {
                //
            },
            edit: async (data) => {
                //
            },
            delete: async (data) => {
                //
            },
            find: async (filters) => {
                //
            },
            fGetId: async (filters) => {
                //
            }
        },
        tariffs: { // TO-DO
            new: async (data) => {
                //
            },
            edit: async (data) => {
                //
            },
            delete: async (data) => {
                //
            },
            find: async (filters) => {
                //
            },
            fGetId: async (filters) => {
                //
            }
        },
        prefixes: { // TO-DO
            new: async (data) => {
                //
            },
            edit: async (data) => {
                //
            },
            delete: async (data) => {
                //
            },
            find: async (filters) => {
                //
            },
            fGetId: async (filters) => {
                //
            }
        }
    }

    reports = {
        cdr: {
            find: async (filters) => {
                let module = 'call'
                this.interpretFilters(filters);
                let r = await this.read(module);

                this.clearFilter()
                return r
            }
        }
    }

    routes = { // TO-DO
        providers: { // TO-DO
            new: async (data) => {
                //
            },
            edit: async (data) => {
                //
            },
            delete: async (data) => {
                //
            },
            find: async (filters) => {
                //
            },
            fGetId: async (filters) => {
                //
            }
        },
        trunks: { // TO-DO
            new: async (data) => {
                //
            },
            edit: async (data) => {
                //
            },
            delete: async (data) => {
                //
            },
            find: async (filters) => {
                //
            },
            fGetId: async (filters) => {
                //
            }
        },
        trunkGroups: { // TO-DO
            new: async (data) => {
                //
            },
            edit: async (data) => {
                //
            },
            delete: async (data) => {
                //
            },
            find: async (filters) => {
                //
            },
            fGetId: async (filters) => {
                //
            }
        }
    }

}

module.exports = {
    MagnusBilling
}

// NOTE TO SELF: ~1500 linhas de código no modelo antigo
// NOTE TO SELF: ~???? linhas de código com a implementação do createEndpoint (fazer)