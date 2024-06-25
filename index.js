const axios = require('axios');
const path = require('path')

// Importante:
// "/var/www/html/mbilling/protected/controllers/DidController.php +462" > adicionar um "s" no "$value[id]"

const { isSet, isFloat, arrayHasKey, createNonce, getQueryString } = require(path.resolve(__dirname, 'lib/utils'));

// User
const { USER_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/clients/user'))
const { SIP_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/clients/sip'))
const { CALLONLINE_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/clients/callonline'))
const { CALLERID_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/clients/callerid'))
const { ATALINKSYS_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/clients/atalinksys'))

// Billing
const { REFILL_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/billing/refill'))

// Dids
const { DIDS_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/dids/dids'))
const { DIDDESTINATION_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/dids/diddestination'))

// Rates
const { PREFIXES_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/rates/prefixes'))
const { PLANS_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/rates/plans'))
const { TARIFFS_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/rates/tariffs'))
const { OFFERS_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/rates/offers'))

// Routes
const { TRUNKS_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/routes/trunks'))
const { PROVIDERS_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/routes/providers'))
const { TRUNKGROUPS_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/routes/trunkgroups'))

// Reports
const { CDR_ENDPOINT } = require(path.resolve(__dirname, 'lib/endpoints/reports/cdr'))

class MagnusBilling {
    constructor(api_key, api_secret, public_url, debug = 3) {
        this.api_key = api_key;
        this.api_secret = api_secret;
        this.public_url = public_url;
        this.debug = debug;
        this.filter = [];
        this.log_tag = "";
        this.echoResponse = false;

        this.signalToLetter = {
            '^': 'st',   // starts with   | começa com
            '$': 'ed',   // ends with     | termina com
            '~=': 'ct',  // contains      | contém
            '*': 'ct',   // contains      | contém (v2.0)
            '=': 'eq',   // equal         | igual
            '<': 'lt',   // less than     | menor que
            '>': 'gt',   // greater than  | maior que
        }

        this.validSignals = ['st', 'ed', 'ct', 'eq', 'lt', 'gt']

    }

    clients = {
        users: USER_ENDPOINT(this),
        sipusers: SIP_ENDPOINT(this),
        callsonline: CALLONLINE_ENDPOINT(this),
        callerid: CALLERID_ENDPOINT(this),
        atalinksys: ATALINKSYS_ENDPOINT(this), // unstable
        //Restricted Number // TODO
        //IAX // TODO
        //User History // TODO
    }
    billing = {
        refill: REFILL_ENDPOINT(this),
        //paymentmethods: {} // TODO
        //voucher: {} // TODO
        //refillproviders: {} // TODO
    }
    dids = {
        dids: DIDS_ENDPOINT(this),
        diddestination: DIDDESTINATION_ENDPOINT(this), // arrumar o edit type
        // didsuse: {},
        // ivrs: {},
        // queues: {},
        // queuesmembers: {},
        // queuedashboard: {},
        // holidays: {},
        // didhistory: {},
    }
    rates = {
        plans: PLANS_ENDPOINT(this),
        tariffs: TARIFFS_ENDPOINT(this),
        prefixes: PREFIXES_ENDPOINT(this),
        // usercustomrates: {},
        offers: OFFERS_ENDPOINT(this),
        // offercdr: {},
        // offeruse: {},
    }
    reports = {
        cdr: CDR_ENDPOINT(this),
        // cdrfailed: {},
        // summaryperday: {},
        // summarydayuser: {},
        // summarydaytrunk: {},
        // summarydayagent: {},
        // summarypermonth: {},
        // summarymonthuser: {},
        // summarymonthtrunk: {},
        // summaryperuser: {},
        // summarypertrunk: {},
        // callarchive: {},
        // summarymonthdid: {},
    }
    routes = {
        providers: PROVIDERS_ENDPOINT(this),
        trunks: TRUNKS_ENDPOINT(this),
        trunkgroups: TRUNKGROUPS_ENDPOINT(this),
        // providerrates: {},
        // servers: {},
        // trunkerrors: {},
    }
    settings = {
        // menus: {},
        // groupusers: {},
        // configuration: {},
        // emailstemplates: {},
        // logusers: {},
        // smtp: {},
        // failtoban: {},
        // api: {},
        // grouptoadmins: {},
        // backup: {},
        // alarms: {},
    }

    // UTILITÁRIOS // ---------------------------------------------------------------------------------------------------

    log = {
        // Função de log com nível.

        trace: (message) => {
            if (this.debug >= 6) { console.log(`[\x1b[36mTRACE\x1b[0m] \x1b[36m${this.log_tag}${message}\x1b[0m`) }
        },
        debug: (message) => {
            if (this.debug >= 5) { console.log(`[\x1b[34mDEBUG\x1b[0m] \x1b[34m${this.log_tag}${message}\x1b[0m`) }
        },
        info: (message) => {
            if (this.debug >= 4) { console.log(`[\x1b[32mINFO \x1b[0m] \x1b[32m${this.log_tag}${message}\x1b[0m`) }
        },
        warn: (message) => {
            if (this.debug >= 3) { console.log(`[\x1b[33mWARN \x1b[0m] \x1b[33m${this.log_tag}${message}\x1b[0m`) }
        },
        error: (message) => {
            if (this.debug >= 2) { console.log(`[\x1b[31mERROR\x1b[0m] \x1b[31m${this.log_tag}${message}\x1b[0m`) }
        },
        fatal: (message) => {
            if (this.debug >= 1) { console.log(`[\x1b[31mFATAL\x1b[0m] \x1b[31m${this.log_tag}${message}\x1b[0m`) }
        },
        setTag: (tag) => { this.log_tag = tag; return this.log },
        clearTag: (tag) => { this.log_tag = ""; return this.log }
    }

    mergeRules = (rule1, rule2) => {
        // Utilizado para mesclar dois arrays de regras
        // arr1: { test: {required: true, max: 5 } }
        // arr2: { test: {default: 5} }
        // mergeRules(arg1, arg2) --->  test: {required: true, max: 5, default: 5} }

        if (typeof rule1 !== 'object' || typeof rule2 !== 'object') {
            throw new Error('Ambos os parâmetros devem ser objetos');
        }
    
        if (Object.keys(rule1).length === 0) return rule2;
        if (Object.keys(rule2).length === 0) return rule1;
    
        const result = {};
    
        for (const key of Object.keys(rule1).concat(Object.keys(rule2))) {
            const props1 = rule1[key] || {};
            const props2 = rule2[key] || {};
    
            const mergedProps = { ...props1, ...props2 };
            const propsKeys = Object.keys(mergedProps);
    
            for (const propKey of propsKeys) {
                if (props1.hasOwnProperty(propKey) && props2.hasOwnProperty(propKey) && props1[propKey] !== props2[propKey]) {
                    throw new Error(`Conflito encontrado para a propriedade '${propKey}' na chave '${key}'`);
                }
            }
    
            result[key] = mergedProps;
        }
    
        return result;
    };

    async formatApiRequirement(data, outputType) {

        // Processamento mais bruto, utilizado por alguns métodos
        function CrudeProcessArgumentRequirements(data) {
            const result = {
                expectedArguments: [],
                integerOnlyArguments: [],
                argumentsLength: []
            };

            data.forEach(item => {
                if (Array.isArray(item)) {
                    if (item[1] === 'required') {
                        result.expectedArguments.push({ arguments: item[0].split(',').map(arg => arg.trim()), logic: 'AND' });
                    }
                } else {
                    for (const key in item) {
                        if (key === 'integerOnly' && item[key]) {
                            result.integerOnlyArguments.push(...item[0].split(',').map(arg => arg.trim()));
                        } else if (key === 'max' && item.hasOwnProperty(key)) {
                            const args = Object.entries(item)[0][1].split(',').map(arg => arg.trim());
                            result.argumentsLength.push({ arguments: args, max: item.max, min: item.min });
                        }
                    }
                }
            });

            return result
        }

        // Utilizando o método bruto, refina o retorno para algo mais simplificado
        function SimplifyArgumentRequirements(data) {
            const result = {};

            // Pegando os argumentos OBRIGATÓRIOS
            if (data.expectedArguments && data.expectedArguments.length > 0) {
                data.expectedArguments.forEach(item => {
                    if (item.logic === "AND") {
                        item.arguments.forEach(arg => {
                            // Inicializando result[arg] somente se tiver vazio
                            if (!result[arg]) {
                                result[arg] = {}
                            }
                            result[arg].required = true;
                        });
                    }
                });
            }

            // Pegando os argumentos INTEGER ONLY
            if (data.integerOnlyArguments && data.integerOnlyArguments.length > 0) {
                data.integerOnlyArguments.forEach(arg => {
                    // Inicializando result[arg] somente se estiver vazio
                    if (!result[arg]) {
                        result[arg] = {}
                    }
                    result[arg].numerical = true;
                    result[arg].integerOnly = true;
                });
            }

            // Pegando o TAMANHO DOS ARGUMENTOS
            data.argumentsLength.forEach(item => {
                item.arguments.forEach(arg => {
                    // Verificando se result[arg] existe antes de atribuir
                    if (!result[arg]) {
                        result[arg] = {};
                    }
                    // Convertendo os valores de max e min para inteiros e atribuindo a maxLength e minLength
                    result[arg].maxLength = parseInt(item.max);
                    if (item.min !== undefined) {
                        result[arg].minLength = parseInt(item.min);
                    }
                });
            });
            return result;
        }

        // Usando o simplificado, gera uma tabela markdown.
        function CreateMarkdownFromSimplifiedArgumentRequirements(data) {

            // Gera a descrição da tabela Markdown
            function getDescription(argument) {
                let description = "";

                if (argument.required) {
                    description += "Required";
                }
                if (argument.maxLength) {
                    if (description !== "") description += ", ";
                    description += `Max Length: ${argument.maxLength}`;
                }
                if (argument.minLength) {
                    if (description !== "") description += ", ";
                    description += `Min Length: ${argument.minLength}`;
                }
                if (argument.numerical && argument.integerOnly) {
                    if (description !== "") description += ", ";
                    description += "Numerical (Integer Only)";
                }

                return description;
            }

            let markdownTable = "Key | Description\n";
            markdownTable += "--- | ---\n";

            for (const key in data) {
                const description = getDescription(data[key]);
                markdownTable += `${key} | ${description}\n`;
            }

            return markdownTable;
        }

        let raw
        let crude
        let simplified
        switch (outputType) {
            case 'raw':
                raw = data;
                return raw;
            case 'crude':
                raw = data;
                return CrudeProcessArgumentRequirements(raw);
            case 'simple':
                raw = data;
                crude = CrudeProcessArgumentRequirements(raw);
                return SimplifyArgumentRequirements(crude);
            case 'table':
            case 'markdowntable':
                raw = data;
                crude = CrudeProcessArgumentRequirements(raw);
                simplified = SimplifyArgumentRequirements(crude);
                return CreateMarkdownFromSimplifiedArgumentRequirements(simplified);
            default:
                if (!outputType) {
                    throw new Error('Repasse o tipo de output!')
                } else {
                    throw new Error('Tipo de output não aceito!')
                }
        }
    }

    // ENDPOINT PREPARATION // ------------------------------------------------------------------------------------------------------------

    // Essa etapa, na verdade, só prepara as regras da API...
    async generateEndpoint(action, module, USER_RULES, SKIP_API = false) {
        // Função que prepara as configurações de um endpoint
        let API_RULES = {}

        // Gerando as regras do endpoint {module}, pela API do MagnusBilling.
        if (action === 'save' &&  !SKIP_API) {
            this.log.info(`- Consultando módulo "${module}" na API getFields...`)
            try {
                // Preparando os requisitos PELA API DO MAGNUS
                API_RULES = await this.getFields(module)
                    .then(res => this.formatApiRequirement(res, 'simple'));
            } catch (err) {
                throw err;
            }
            this.log.clearTag().setTag('[generateEndpoint] ') // desgraça (a requisição acima dá replace na minha tag, tenho que setá-la denovo)
            this.log.debug('Valores retornados pela pesquisa de requisitos na API:')
            this.log.debug(JSON.stringify(API_RULES))
        } else {
            this.log.info(`- O módulo "${module}" não foi consultado na API getFields.`)
        }


        // Mesclando as regras de {module} vindas da API e da configuração do Endpoint 
        const argumentRules = this.mergeRules(USER_RULES, API_RULES)
        const ENDPOINT_CONFIG = {
            action,
            module,
            argumentRules
        }

        this.log.debug('- Generated configs:')
        this.log.debug(JSON.stringify(ENDPOINT_CONFIG))

        // Criando a lógica do endpoint com as configurações geradas
        const endpoint = this.buildEndpointHandler(ENDPOINT_CONFIG);
        return endpoint;
    }

    // Essa função retorna outra função pra ser usada de endpoint.
    // Nessa etapa é feita a validação das regras, e, com as regras de acordo, é feito a query de fato ao MagnusBilling para o módulo e ação.
    buildEndpointHandler(parameters) {
        return async (data) => {
            this.log.clearTag().setTag(`[buildEndpointHandler] `);
            this.log.info(`<@> Gerando endpoint "${parameters.module}/${parameters.action}" <@>`)
            this.log.trace(`Data array: ${JSON.stringify(data)}`);

            // Interpretando as regras.
            let payload_additions;
            payload_additions = this.interpretArguments(data, parameters);

            // Criando a carga (payload) com base:
            // 1. No retorno da interpretação das regras: "payload_additions" (daqui vem os valores defaults, e os valores fixos)
            // 2. Nos argumentos repassados pelo usuário: "data" (daqui vem os argumentos e valores do usuário)
            let payload = Object.assign(data, payload_additions);
            payload.module = parameters.module;
            payload.action = parameters.action;

            this.log.info("Payload gerada!");
            this.log.debug(JSON.stringify(payload));
            this.log.trace("- Additions: " + JSON.stringify(payload_additions));

            this.log.info(" <@> CHECAGEM DE ARGUMENTOS OK <@> ");

            if (parameters.action === 'read') {
                this.log.trace(`<-> read action <->`)
                // Métodos: find, getid
                this.interpretFilters(data.filtro);
                const DEFAULT_PAGE = 1;
                const DEFAULT_LIMIT = 25;

                payload.page = payload.page ?? 1;
                payload.limit = payload.limit ?? 25;
                payload.start === 1 ? 0 : (parameters.page - 1) * payload.limit;
                payload.filter = JSON.stringify(this.filter);

                this.log.trace(`<-> Pages : ${payload.page}`);
                this.log.trace(`<-> Limit : ${payload.limit}`);
                this.log.trace(`<-> Start : ${payload.start}`);
                this.log.trace(`<-> Filter: ${payload.filter}`);
                let ret = await this.query(payload);
                this.clearFilter();
                return ret;
            } else {
                // todos os outros métodos
                return await this.query(payload);
            }
        }
    }

    validateProhibited(payload, argument, rule, badArgs) {
        if (isSet(rule.prohibited)) {
            if (payload[argument]) {
                this.log.error(`[${argument}] - Prohibited: Argumento ${argument} proibido!`)
                badArgs.prohibited.push(argument)
            } else {
                payload[argument] = rule.fixed
                this.log.trace(`[${argument}] - PROHIBITED: Argumento não é proibido..`)
            }
        }
    }

    validateFixed(payload, argument, rule, badArgs) {
        if (isSet(rule.fixed)) {
            if (payload[argument]) {
                this.log.error(`[${argument}] - FIXED: Argumento ${argument} proibido! Não repasse argumentos fixos.`)
                badArgs.fixed.push(argument)
            } else {
                payload[argument] = rule.fixed
                this.log.trace(`[${argument}] - FIXED: Adicionado à payload como "${rule.fixed}".`)
            }
        }
    }

    validateDefault(payload, argument, rule) {
        if (isSet(rule.default)) {
            if (!payload[argument]) { // Se não foi repassado pelo usuário, adiciono à payload.
                payload[argument] = rule.default
                this.log.trace(`[${argument}] - DEFAULT: Adicionado à payload como "${rule.default}".`)
            } else {
                this.log.trace(`[${argument}] - DEFAULT: Está presente, permanecerá como "${payload[argument]}".`)
            }
        }
    }

    validateRequired(payload, argument, rule, badArgs) {
        if (rule.required) {
            if (!payload[argument]) {
                this.log.error(`[${argument}] - REQUIRED: Argumento obrigatório: ${argument}`)
                badArgs.required.push(argument)
            } else {
                this.log.trace(`[${argument}] - REQUIRED: Está presente.`)
            }
        }
    }

    validateMaxLength(payload, argument, rule, badArgs) {
        if (rule.maxLength) {
            if (payload[argument]) {
                let field = String(payload[argument])
                if (field.length > rule.maxLength) {
                    this.log.error(`[${argument}] - MAXLENGTH: Excedeu o limite de caracteres!`)
                    badArgs.maxlength.push(argument)
                } else {
                    this.log.trace(`[${argument}] - MAXLENGTH: Não excede o limite de caracteres.`)
                }
            } else {
                this.log.trace(`[${argument}] - MAXLENGTH: Argumento não está presente.`)
            }
        }
    }

    validateMinLength(payload, argument, rule, badArgs) {
        if (rule.minLength) {
            if (payload[argument]) {
                let field = String(payload[argument])
                if (field.length < rule.minLength) {
                    this.log.error(`[${argument}] - MINLENGTH: Não atingiu a quatidade mínima de caracteres!`)
                    badArgs.minlength.push(argument)
                } else {
                    this.log.trace(`[${argument}] - MINLENGTH: Tem mais caractéres que o mínimo: OK.`)
                }
            } else {
                this.log.trace(`[${argument}] - MINLENGTH: Argumento não está presente.`)
            }
        }
    }

    checkArgumentErrors(badArgs) {
        let problems = []
        if (badArgs.prohibited.length > 0) {
            problems.push(`Argumentos proibidos: ${badArgs.prohibited.join(", ")}`)
        } 

        if (badArgs.fixed.length > 0) {
            problems.push(`Argumentos fixos proibidos: ${badArgs.fixed.join(", ")}`)
        }

        if (badArgs.required.length > 0) {
            problems.push(`Argumentos necessários: ${badArgs.required.join(", ")}`)
        }

        if (badArgs.maxlength.length > 0) {
            problems.push(`Argumentos com tamanho excedido: ${badArgs.maxLength.join(", ")}`)
        }

        if (badArgs.minlength.length > 0) {
            problems.push(`Argumentos fora do tamanho mínimo: ${badArgs.minLength.join(", ")}`)
        }

        // Throwing if anything points to an error
        if (problems.length > 0) { 
            throw new Error(problems.join("; "))
        }

    }

    interpretArguments(data, parameters) {
        let payload = {...data};

        this.log.trace(`Regras: ${JSON.stringify(parameters.argumentRules)}`)
        let badArguments = {
            prohibited: [],
            fixed: [],
            required: [],
            maxlength: [],
            minlength: []
        }
        for (const argument in parameters.argumentRules) {
            const rule = parameters.argumentRules[argument];
            // argument : Argumento que estou validando
            // rule     : Regras do argumento que estou validando.

            // Explicação de tags dos argumentos.
            // required: bool > é um argumento obrigatório?
            // default: any > valor padrão do argumento. se for repassado em data, será sobreescrito
            // fixed: any > valor padrão do argumento. se for repassado em data, apresentará ERRO
            // numeric: bool > é um argumento numérico (float/integer)?
            // integerOnly: bool > é um argumento somente inteiro (integer)?
            // minLength: int > quantidade mínima de tamanho de caracteres do argumento
            // maxLength: int > quantidade máxima de tamanho de caracteres do argumento
            // prohibited: bool > se o argumento NÃO PODE ser repassado

            // Validando PROHIBITED (se existir em data, dar erro. else, else, nada.)
            this.validateProhibited(payload, argument, rule, badArguments)

            // Validando FIXED (se existir em data, dar erro. else, acrescentar na payload)
            this.validateFixed(payload, argument, rule, badArguments)
            
            // Validando DEFAULT (se ja existir em data, pular. else, acrescentar na payload)
            this.validateDefault(payload, argument, rule) // nao tem badarg aqui, porque nao tem como isso retornar um problema
            
            // Validando REQUIRED (se não existir em data, **E** este argumento NÃO CONTER A REGRA fixed **OU** default, da erro)]
            this.validateRequired(payload, argument, rule, badArguments)

            // Validando MAX LENGTH (se o tamanho do argumento em data for maior que essa regra)
            this.validateMaxLength(payload, argument, rule, badArguments)

            // Validando MIN LENGTH (se o tamanho do argumento em data for menor que essa regra)
            this.validateMinLength(payload, argument, rule, badArguments)

        }

        // Conferindo se alguma das validações anteriores deu algum problema.
        this.checkArgumentErrors(badArguments);

        return payload
    }

    // API // ------------------------------------------------------------------------------------------------------------

    async query(req = {}) {
        let payload
        let { module, action } = req;
        module = module ?? '';
        action = action ?? '';
        this.log.clearTag().setTag(`[query] [${module}/${action}] `)

        // Conferindo se está deletando vários IDs ao mesmo tempo: Caso esteja, preciso reformular a carga (payload) de outra maneira para a API do MagnusBilling.
        if (action === 'destroy') {
            this.log.info('<#> É uma requisição DESTROY! <#>')
            if (Array.isArray(req.id)) {
                this.log.info('<#> Está passando multiplos IDs! Reformulando payload... <#>')
                this.log.trace(`- Payload antiga : ${JSON.stringify(req)}`)

                // TODO: deixar essa merda mais bonita. por enquanto NAO ENCOSTA, ESTÁ FUNCIONANDO.
                payload = { ...req }
                delete payload.id
                delete payload.module
                req.id.forEach(id => {
                    payload.rows = JSON.stringify(req.id.map(id => ({ id })));
                });
                req = payload
                this.log.trace(`- Payload nova   : ${JSON.stringify(req)}`)
            }
        }

        req.nonce = createNonce()
        this.log.info("Gerado \"nonce\".")
        this.log.debug('- nonce: ' + req.nonce)

        const post_data = getQueryString(req)
        this.log.info("Gerado \"post_data\".")
        this.log.debug('- post_data: ' + post_data)

        // Gerando a assinatura com a API KEY
        this.log.trace('Gerando sign...')
        const _HMAC512 = require('crypto').createHmac('sha512', this.api_secret);
        const _CONTENT_AWARE_HMAC512 = _HMAC512.update(post_data);
        const _HEX_CONTENT_AWARE_HMAC512 = _CONTENT_AWARE_HMAC512.digest('hex');
        const sign = _HEX_CONTENT_AWARE_HMAC512
        this.log.trace(`-     API Secret        : ${this.api_secret}`);
        this.log.trace(`-        HMAC512        : ${_HMAC512}`);
        this.log.trace(`-     CA HMAC512        : ${_CONTENT_AWARE_HMAC512}`);
        this.log.trace(`- HEX CA HMAC512 (Sign) : ${_HEX_CONTENT_AWARE_HMAC512}`)
        this.log.info("Gerado \"sign\".")
        this.log.debug('- sign: ' + sign)

        // Gerar os cabeçalhos extras
        const headers = {
            'Key': this.api_key,
            'Sign': sign
        };
        this.log.info("Gerado \"headers\".")
        this.log.debug('- headers: ' + JSON.stringify(headers))

        this.log.info(`<@> Enviando requisição para "${this.public_url}/index.php/${module}/${action}"... <@>`)
        this.log.debug(`- Headers: ${JSON.stringify(headers)}`)
        this.log.debug(`- Body   : ${JSON.stringify(post_data)}`)

        try {
            const response = await axios.post(`${this.public_url}/index.php/${module}/${action}`, post_data, {
                headers: headers,
                httpsAgent: {
                    rejectUnauthorized: false // Para ignorar a verificação do certificado SSL
                }
            });

            this.log.info("<@> Resposta recebida! <@>")
            if (this.echoResponse) {
                console.log(response.data)
            }
            return response.data;
        } catch (error) {
            this.log.info(`${error.config.method}:${error.config.url} [${error.config.data}]`)
            this.log.error(JSON.stringify(error))
            throw new Error(error).stack
        }
    }

    // ---------------------------- // Utilitários para leitura de dados // ----------------------------------- //

    // Filtrar dados na query
    setFilter(field, value, comparison = 'st', type = 'string') {
        this.log.trace(`Campo: ${field}`)
        this.log.trace(`Valor: ${value}`)
        this.log.trace(`Comp.: ${comparison}`)
        this.log.trace(`Tipo : ${type}`)
        
        this.filter.push({
            type: type,
            field: field,
            value: value,
            comparison: comparison
        });
    }
    
    // Remover os filtros
    clearFilter() {
        this.filter = [];
    }

    // Forma "simplificada" de passar vários filtros ao mesmo tempo
    // filterList = [ ['arg', 'comparison', 'value'], ['arg', 'comparison', 'value'], ... ]
    interpretFilters(filterList) {
        if (filterList !== undefined && filterList.length > 0) {
            // console.log('filter list:' + filterList)
            filterList.forEach(filtro => {
                // console.log(`Filtros recebidos: ${filtro}`);
                let [campo, operador, valor, tipo] = filtro;

                // '=' -> 'eq'
                const operadorInterpretado = this.signalToLetter[operador] || operador;

                if (!this.validSignals.includes(operadorInterpretado)) {
                    throw new Error(`Operador comparativo "${operadorInterpretado}" inválido. Seu filtro está correto?`).stack
                }

                // Confirmando
                // console.log('Campo    : ' + campo + ' | Tipo: ' + typeof(campo));
                // console.log('Operador : ' + operadorInterpretado + ' | Tipo: ' + typeof(operadorInterpretado));
                // console.log('Valor    : ' + valor + ' | Tipo: ' + typeof(valor));
                // console.log('Tipo     : ' + tipo + ' | Tipo: ' + typeof(tipo));

                this.setFilter(campo, valor, operadorInterpretado, tipo);

            });
        }
    }

    // ---------------------------- // Utilitários da API do MagnusBilling // ----------------------------------- //

    // Confirmar requisitos de cada argumento
    async getFields(module) {
        return await this.query({
            module: module,
            getFields: 1
        });
    }

    // Confirmar todos módulos existentes
    async getModules() {
        return await this.query({
            getModules: 1
        });
    }

    // ?
    async getMenu(username) {
        return await this.query({
            username: username,
            getMenu: 1
        });
    }
    

}

module.exports = {
    MagnusBilling
}

// NOTE TO SELF: ~1500 linhas de código no modelo antigo
// NOTE TO SELF: ~???? linhas de código com a implementação do createEndpoint (fazer)