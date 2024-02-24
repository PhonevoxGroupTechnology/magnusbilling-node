const axios = require('axios');

const { InvalidOperator, Denied, ValidatingError, FindError, ExpectedArgumentMisuse, ExpectedArgumentMissingArg, ExpectedArgumentTooManyArguments } = require('./lib/Errors')

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

        this._mappingTraducaoCamposSipAccounts = {
            "id_usuario": "id_user",
            "nome": "name",
            "codigo_conta": "accountcode",
            "extensao_registro": "regexten",
            "flags_ama": "amaflags",
            "grupo_chamada": "callgroup",
            "caller_id": "callerid",
            "midia_direta": "directmedia",
            "contexto": "context",
            "ip_padrao": "DEFAULTip",
            "modo_dtmf": "dtmfmode",
            "usuario_origem": "fromuser",
            "dominio_origem": "fromdomain",
            "host": "host",
            "grupo_sip": "sip_group",
            "inseguro": "insecure",
            "idioma": "language",
            "caixa_postal": "mailbox",
            "segredo_md5": "md5secret",
            "nat": "nat",
            "negar": "deny",
            "permitir": "permit",
            "grupo_pickup": "pickupgroup",
            "porta": "port",
            "qualificar": "qualify",
            "rtptimeout": "rtptimeout",
            "rtpholdtimeout": "rtpholdtimeout",
            "segredo": "secret",
            "tipo": "type",
            "desabilitar": "disallow",
            "permitir": "allow",
            "segundos_registro": "regseconds",
            "endereco_ip": "ipaddr",
            "contato_completo": "fullcontact",
            "configurar_variavel": "setvar",
            "servidor_registro": "regserver",
            "ultimos_milissegundos": "lastms",
            "usuario_padrao": "defaultuser",
            "autenticacao": "auth",
            "inscrever_mwi": "subscribemwi",
            "extensao_vm": "vmexten",
            "numero_cid": "cid_number",
            "apresentacao_chamada": "callingpres",
            "requisitar_telefone": "usereqphone",
            "sugerir_moh": "mohsuggest",
            "permitir_transferencia": "allowtransfer",
            "autoframing": "autoframing",
            "taxa_max_chamada": "maxcallbitrate",
            "proxy_saida": "outboundproxy",
            "rtpkeepalive": "rtpkeepalive",
            "agente_usuario": "useragent",
            "limite_chamada": "calllimit",
            "status_linha": "lineStatus",
            "url_eventos": "url_events",
            "falso_ring": "ringfalse",
            "gravar_chamada": "record_call",
            "caixa_voicemail": "voicemail",
            "encaminhar": "forward",
            "bloquear_reg_chamada": "block_call_reg",
            "tempo_discagem": "dial_timeout",
            "prefixo_tecnico": "techprefix",
            "alias": "alias",
            "descricao": "description",
            "adicionar_param": "addparameter",
            "amd": "amd",
            "cnl": "cnl",
            "id_grupo_trunk": "id_trunk_group",
            "suporte_video": "videosupport",
            "tipo_encaminhamento": "type_forward",
            "id_ivr": "id_ivr",
            "id_fila": "id_queue",
            "id_sip": "id_sip",
            "extensao": "extension",
            "email_voicemail": "voicemail_email",
            "senha_voicemail": "voicemail_password",
            "config_sip": "sip_config",
            "mostrar_peer": "sipshowpeer"
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
            console.log(error)
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
        if (filterList !== undefined && filterList.length > 0) {
            filterList.forEach(filtro => {
                console.log(`Filtros recebidos: ${filtro}`);
                const [campo, operador, valor, tipo] = filtro;

                // 'usuario' -> 'username'
                const campoInterpretado = this._mappingTraducaoCamposUsers[campo] || campo;
                // '=' -> 'eq'
                const operadorInterpretado = this._mappingSinaisOperacao[operador] || operador;

                if (!this._validSinaisOperacao.includes(operadorInterpretado)) {
                    throw new InvalidOperator(`Operador comparativo "${operadorInterpretado}" inválido. Seu filtro está correto?`).stack
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
        } else if (condition === "OR") {
            if (!expectedArgs.some(arg => arg in data)) {
                throw new ExpectedArgumentMissingArg(`Argumentos necessários: ${expectedArgs.join(', ')}`).stack;
            }
        } else if (condition === "XOR") {
            const presentArgsCount = expectedArgs.filter(arg => arg in data).length;
            if (presentArgsCount === 0) {
                throw new ExpectedArgumentMissingArg(`Ao menos um argumento necessário: ${expectedArgs.join(', ')}`).stack;
            }
            if (!(presentArgsCount === 1)) {
                throw new ExpectedArgumentTooManyArguments(`Apenas um dos argumentos é necessário: ${expectedArgs.join(', ')}`).stack;
            }
            // if (!(expectedArgs.some(arg => arg in data) ^ expectedArgs.every(arg => arg in data))) {
            //     throw new ExpectedArgumentTooManyArguments(`Apenas um dos argumentos é necessário: ${expectedArgs.join(', ')}`).stack;
            // }
        } else {
            throw new ExpectedArgumentMisuse(`Condição inválida: ${condition}. Condição precisa ser "AND" ou "OR".`).stack;
        }
    }

    opcional(chave, valor) {
        return valor !== undefined ? { [chave]: valor } : {};
    }

    // API Simplificada
    clients = {
        users: {
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
                return await this.read(module);
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
                this._ExpectedArgs(data, ['id', 'filtro'], "XOR");
                data.id = data.filtro ? await this.clients.users.fGetId(data.filtro) : data.id; // Se passou filtro, uso. Se não, uso ID. Garanto que não tem ambos através do ExpectedArgs:XOR

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
                this._ExpectedArgs(data, ['id', 'filtro'], "XOR");
                data.id = data.filtro ? await this.clients.users.fGetId(data.filtro) : data.id; // Se passou filtro, uso. Se não, uso ID. Garanto que não tem ambos através do ExpectedArgs:XOR

                let module = 'user';
                let payload = {
                    module: module,
                    action: 'save',
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
                        console.log(`---> O ID desse usuário é: ${user.id}`);
                        return user.id;
                    }
                } catch (err) {
                    throw new FindError(`${err}`).stack;
                }
            }
        },
        sipUsers: {
            new: async (data) => {
                let module = 'sip'
                let action = 'save'

                this._ExpectedArgs(data, ['defaultuser', 'secret'], "AND")
                this._ExpectedArgs(data, ['filtro', 'id_user'], "XOR")

                let payload = {
                    module: module, // Obrigatório, defualt
                    action: action, // Obrigatório, defualt
                    id: 0,          // Obrigatório, defualt
                    id_user: data.id_user ?? await this.clients.users.fGetId(data.filtro), // Obrigatório, input
                    defaultuser: data.defaultuser, // Obrigatório, input
                    secret: data.secret,           // Obrigatório, input
                    name: data.name ?? '',         // Obrigatório, default
                    callerid: data.callerid ?? '', // Obrigatório, default
                    ...this.opcional('directmedia', data.directmedia),
                    ...this.opcional('context', data.context),
                    ...this.opcional('dtmfmode', data.dtmfmode),
                    ...this.opcional('host', data.host),
                    ...this.opcional('insecure', data.insecure),
                    ...this.opcional('nat', data.nat),
                    ...this.opcional('qualify', data.qualify),
                    ...this.opcional('type', data.type),
                    ...this.opcional('disallow', data.disallow),
                    ...this.opcional('allow', data.allow),
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
