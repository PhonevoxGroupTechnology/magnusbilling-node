const axios = require('axios');

// Importante:
// "/var/www/html/mbilling/protected/controllers/DidController.php +462" > adicionar um "s" no "$value[id]"

const { isSet, isFloat, arrayHasKey } = require('./lib/utils');

// User
const { USER_ENDPOINT } = require('./lib/endpoints/clients/user')
const { SIP_ENDPOINT } = require('./lib/endpoints/clients/sip')
const { CALLONLINE_ENDPOINT } = require('./lib/endpoints/clients/callonline')
const { CALLERID_ENDPOINT } = require('./lib/endpoints/clients/callerid')
const { ATALINKSYS_ENDPOINT } = require('./lib/endpoints/clients/atalinksys')

// Billing
const { REFILL_ENDPOINT } = require('./lib/endpoints/billing/refill')

// Dids
const { DIDS_ENDPOINT } = require('./lib/endpoints/dids/dids')
const { DIDDESTINATION_ENDPOINT } = require('./lib/endpoints/dids/diddestination')

// Rates
const { PREFIXES_ENDPOINT } = require('./lib/endpoints/rates/prefixes')
const { PLANS_ENDPOINT } = require('./lib/endpoints/rates/plans')
const { TARIFFS_ENDPOINT } = require('./lib/endpoints/rates/tariffs')
const { OFFERS_ENDPOINT } = require('./lib/endpoints/rates/offers')

// Routes
const { TRUNKS_ENDPOINT } = require('./lib/endpoints/routes/trunks')
const { PROVIDERS_ENDPOINT } = require('./lib/endpoints/routes/providers')
const { TRUNKGROUPS_ENDPOINT } = require('./lib/endpoints/routes/trunkgroups')

// Reports
const { CDR_ENDPOINT } = require('./lib/endpoints/reports/cdr')

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

    // Função de log com nível.
    log = {
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

    // Recebe dois objetos
    // arr1: { test: {required: true, max: 5 } }
    // arr2: { test: {default: 5} }
    // e mescla-os em um:
    // res: { test: {required: true, max: 5, default: 5} }
    // Necessário para mesclar USER_RULES com API_RULES (em específico, nos método save (add) )
    mergeRules = (rule1, rule2) => {
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

    // Função que prepara as configurações de um endpoint
    async generateEndpoint(action, module, USER_RULES, SKIP_API = false) {
        let API_RULES = {}
        if (action === 'save' &&  !SKIP_API) { // módulo desgraçado!
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


        // Mesclando a configuração da API com a configuração do endpoint segundo o usuário
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

    // Função que, a partir da configuração do endpoint, constrói-o e executa a ação de fato
    buildEndpointHandler(parameters) {
        return async (data) => {
            this.log.clearTag().setTag(`[buildEndpointHandler] `);
            this.log.info(`<@> Gerando endpoint "${parameters.module}/${parameters.action}" <@>`)
            this.log.trace(`Data array: ${JSON.stringify(data)}`);

            // Adicionando ARGUMENTS para Payload
            let payload_additions;
            payload_additions = this.interpretArguments(data, parameters);

            // Adicionando DATA para Payload
            let payload = Object.assign(data, payload_additions);
            payload.module = parameters.module;
            payload.action = parameters.action;

            this.log.info("Payload gerada!");
            this.log.debug(JSON.stringify(payload));
            this.log.trace("- Additions: " + JSON.stringify(payload_additions));

            this.log.info(" <@> CHECAGEM DE ARGUMENTOS OK <@> ");

            if (parameters.action === 'read') {
                this.interpretFilters(data.filtro)
                payload.page = parameters.page ?? 1
                payload.start === 1 ? 0 : (parameters.page - 1) * 25
                payload.limit = 25
                payload.filter = JSON.stringify(this.filter)
                let ret = await this.query(payload)
                this.clearFilter()
                return ret
            } else if (parameters.action === 'destroy') {
                payload.multi = true
                return await this.query(payload)
            } else {
                return await this.query(payload);
            }
        }
    }

    interpretArguments(data, parameters) {
        // TODO:
        // Falar os erros todos de uma vez, e não um argumento por vez.
        // Se tiver 3 argumentos errados, o usuário terá que rodar 3 vezes, e corrigir um a 1.
        // Quero que, se tiver 3 argumentos errados, informe os 3 argumentos que estão errados desde a primeira "rodada".

        let payload = {...data};

        console.log(parameters.argumentRules)
        for (const argument in parameters.argumentRules) {
            const rule = parameters.argumentRules[argument];
            // argument : Argumento que estou validando
            // rule     : Regras do argumento que estou validando.

            // primeiro valido os fixos e defaults, para acrescentá-los à data
            // this.log.info(`Verificando regras do argumento ${argument}...`)

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
            if (isSet(rule.prohibited)) {
                if (payload[argument]) {
                    this.log.error(`[${argument}] - Prohibited: Argumento ${argument} proibido!`)
                    throw new Error("Argumento proibido.").stack
                } else {
                    payload[argument] = rule.fixed
                    this.log.trace(`[${argument}] - PROHIBITED: Argumento não é proibido..`)
                }
            }

            // Validando FIXED (se existir em data, dar erro. else, acrescentar na payload)
            if (isSet(rule.fixed)) {
                if (payload[argument]) {
                    this.log.error(`[${argument}] - FIXED: Argumento ${argument} proibido! Não repasse argumentos fixos.`)
                    throw new Error("Não repasse argumentos fixos.").stack
                } else {
                    payload[argument] = rule.fixed
                    this.log.trace(`[${argument}] - FIXED: Adicionado à payload como "${rule.fixed}".`)
                }
            }

            // Validando DEFAULT (se ja existir em data, pular. else, acrescentar na payload)
            if (isSet(rule.default)) {
                if (!payload[argument]) { // Se não foi repassado pelo usuário, adiciono à payload.
                    payload[argument] = rule.default
                    this.log.trace(`[${argument}] - DEFAULT: Adicionado à payload como "${rule.default}".`)
                } else {
                    this.log.trace(`[${argument}] - DEFAULT: Está presente, permanecerá como "${payload[argument]}".`)
                }
            }

            // Validando REQUIRED (se não existir em data, **E** este argumento NÃO CONTER A REGRA fixed **OU** default, da erro)
            if (rule.required) {
                if (!payload[argument]) {
                    this.log.error(`[${argument}] - REQUIRED: Argumento obrigatório: ${argument}`)
                    throw new Error(`Argumento obrigatório: ${argument}`)
                } else {
                    this.log.trace(`[${argument}] - REQUIRED: Está presente.`)
                }
            }

            // Validando MAX LENGTH (se o tamanho do argumento em data for maior que essa regra)
            if (rule.maxLength) {
                if (payload[argument]) {
                    let field = String(payload[argument])
                    if (field.length > rule.maxLength) {
                        this.log.error(`[${argument}] - MAXLENGTH: Excedeu o limite de caracteres!`)
                        throw new Error(`Argumento "${argument}" excede o limite de "${rule.maxLength}" caracteres.`)
                    } else {
                        this.log.trace(`[${argument}] - MAXLENGTH: Não excede o limite de caracteres.`)
                    }
                } else {
                    this.log.trace(`[${argument}] - MAXLENGTH: Argumento não está presente.`)
                }
            }

            // Validando MIN LENGTH (se o tamanho do argumento em data for menor que essa regra)
            if (rule.minLength) {
                this.log.debug(`${argument} : Validando regra MINLENGTH`)
                this.log.trace("- Regra existe.")
                // verificar tanto em data quanto em payload
            }

        }

        return payload
    }

    checkExpectedArguments(data, expectedArguments) {
        expectedArguments.forEach(exp => {
            // x, y, NOR
            // a, b, c, AND
            this.validateLogic(data, exp.arguments, exp.logic)
        });
    }

    validateDefaultArguments(data, defaultArguments) {
        let ret = {}

        // Vejo a lista de argumentos que precisam de um valor padrão
        defaultArguments.forEach(def => {

            // Se o argumento não foi repassado pelo usuário, acrescento-o á lista de argumentos à adicionar na payload
            if (!arrayHasKey(data, def.argument)) {
                ret[def.argument] = def.value
            }
        })
        // Envio os argumentos que devem ser acrescentados à payload
        return ret
    }

    validateFixedArguments(data, fixedArguments) {
        let ret = {}
        let FORBIDDEN_ARGS = []

        // Vejo a lista de argumentos proibidos
        fixedArguments.forEach(fix => {

            // Se essa chave existir, adiciono à lista de argumentos que apontaram problema
            if (arrayHasKey(data, fix.argument)) {
                FORBIDDEN_ARGS.push(fix.argument)
            } else {
                ret[fix.argument] = fix.value
            }
        })

        // Se foi identificado algum argumento proibido (key "fix.argument" existe em "data"), informo erro.
        if (FORBIDDEN_ARGS.length > 0) {
            throw new Error(`Não repasse argumentos fixos: ${FORBIDDEN_ARGS.join(', ')}`)
        }

        // Envio os argumentos que devem ser acrescentados à payload
        return ret
    }

    validateLogic(data, expectedArguments, logic = "AND") {
        let MISSING_ARGS
        let PRESENT_ARGS
        let FORBIDDEN_ARGS
        this.log.trace(`[ValidateLogic] - Lógica: ${logic}`)
        this.log.trace(`[ValidateLogic] Argumentos: ${expectedArguments.join(', ')}`)
        switch (logic) {
            case 'AND':
                MISSING_ARGS = expectedArguments.filter(arg => !(arg in data))
                if (MISSING_ARGS.length > 0) {
                    throw new Error(`Argumentos necessários: ${MISSING_ARGS.join(', ')}`).stack;
                }
                break;
            case 'OR':
                if (!expectedArguments.some(arg => arg in data)) {
                    throw new Error(`Argumentos necessários: ${expectedArguments.join(', ')}`).stack;
                }
                break;
            case 'NAND':
                FORBIDDEN_ARGS = expectedArguments.filter(arg => arg in data).length;
                if (FORBIDDEN_ARGS === expectedArguments.length) {
                    throw new Error(`Conflito de argumentos: ${expectedArguments.join(', ')}`).stack;
                }
                break;
            case 'NOR':
                FORBIDDEN_ARGS = expectedArguments.filter(arg => arg in data);
                if (FORBIDDEN_ARGS.length > 0) {
                    throw new Error(`Argumentos não permitidos: ${FORBIDDEN_ARGS.join(', ')}`).stack;
                }
                break;
            case 'XOR':
                PRESENT_ARGS = expectedArguments.filter(arg => arg in data).length;
                if (PRESENT_ARGS === 0) {
                    throw new Error(`Ao menos um argumento necessário: ${expectedArguments.join(', ')}`).stack;
                }
                if (!(PRESENT_ARGS === 1)) {
                    throw new Error(`Apenas um dos argumentos é necessário: ${expectedArguments.join(', ')}`).stack;
                }
                break;
            case 'XNOR':
                PRESENT_ARGS = expectedArguments.filter(arg => arg in data).length;
                if (!((PRESENT_ARGS === 0) || (PRESENT_ARGS === expectedArguments.length))) {
                    throw new Error(`Todos ou nenhum dos argumentos são necessários: ${expectedArguments.join(', ')}`).stack;
                }
                break;
            default:
                throw new Error(`Tipo de lógica inválida: ${logic}`)
                ;
        }
    }

    validateArgumentsLength(data, argumentsLength) {
        let BAD_ARGS_MAX = []
        let BAD_ARGS_MIN = []
        for (const item of argumentsLength) {
            const { arguments: args, max } = item; // Renomeando para evitar conflito com a palavra reservada 'arguments'
            for (const key of args) {
                if (key in data) {

                    // Stringi-fico o valor, pois não existe value.length de número por exemplo.
                    // E se não for uma string, vai me causar problemas.
                    // TODO: refatorar isso?
                    // https://stackoverflow.com/questions/10952615/how-can-i-find-the-length-of-a-number
                    const value = String(data[key]); // stringi-fico, pois só quero saber o tamanho. importante notar que se o valor for um float, o PONTO será contado como um caractere a mais.
                    if (typeof value !== 'string') {
                        this.log.warning("ARGUMENTS LENGTH: O tamanho")
                    }
                    if (typeof value !== 'string' || value.length > max) {
                        BAD_ARGS_MAX.push(`${key}:${max}`)
                    }
                }
            }
        }

        // preguiça de corrigir isso pra exibir os dois erros de uma vez só. primeiro vai avisar max, depois vai avisar min.
        if (BAD_ARGS_MAX.length > 0) {
            throw new Error(`Os seguintes valores excedem o limite de caractere: ${BAD_ARGS_MAX.join(', ')}`).stack
        }

        if (BAD_ARGS_MIN.length > 0) {
            throw new Error(`Os seguintes valores não batem o limite mínimo de caractere: ${BAD_ARGS_MIN.join(', ')}`).stack
        }
    }

    validateIntegerOnlyArguments(data, integerOnlyArguments) {
        let BAD_ARGS = []
        for (const key in data) {
            if (integerOnlyArguments.includes(key)) {
                const value = data[key];
                this.log.trace('[ValidateInteger] - Checando argumento: ' + key)
                this.log.trace('[ValidateInteger] Valor: ' + value)
                this.log.trace('[ValidateInteger] Tipo: ' + typeof (value))
                if (!Number.isInteger(value)) {
                    BAD_ARGS.push(key)
                }
                this.log.trace('[ValidateInteger] Bad Arguments: ' + BAD_ARGS)
            }
        }

        if (BAD_ARGS.length > 0) {
            throw new Error(`Os seguintes argumentos precisam ser inteiros: ${BAD_ARGS.join(', ')}`).stack;
        }
    }

    // API // ------------------------------------------------------------------------------------------------------------

    async query(req = {}) {
        // console.log(req)

        let payload
        let { module, action } = req;
        module = module ?? '';
        action = action ?? '';
        this.log.clearTag().setTag(`[query] [${module}/${action}] `)

        // Se for um delete, eu vejo se tá passando uma LISTA no ID. 
        // Caso seja lista eu preciso editar o formato da payload para permitir apagar vários em uma única request.
        if (action === 'destroy') {
            this.log.info('<#> É uma requisição DESTROY! <#>')
            if (Array.isArray(req.id)) {
                this.log.info('<#> Está passando multiplos IDs! Reformulando payload... <#>')
                this.log.trace(`- Payload antiga : ${JSON.stringify(req)}`)
                // TODO: deixar essa merda mais bonita. por enquanto NAO ENCOSTA, ESTÁ FUNCIONANDO.
                payload = { ...req }
                delete payload.id
                delete payload.multi
                delete payload.module
                req.id.forEach(id => {
                    payload.rows = JSON.stringify(req.id.map(id => ({ id })));
                });
                req = payload
                this.log.trace(`- Payload nova   : ${JSON.stringify(req)}`)
            }
        }

        // Gerar um nonce para evitar problemas com sistemas de 32 bits
        const mt = new Date().getTime().toString();
        req.nonce = mt.slice(-10) + mt.substr(2, 6);
        this.log.info("Gerado \"nonce\".")
        this.log.debug('- nonce: ' + req.nonce)

        // Gerar a string de dados POST
        const post_data = new URLSearchParams(req).toString();
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

    clearFilter() {
        this.filter = [];
    }

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

    interpretFilters(filterList) {
        if (filterList !== undefined && filterList.length > 0) {
            // console.log('filter list:' + filterList)
            filterList.forEach(filtro => {
                // console.log(`Filtros recebidos: ${filtro}`);
                let [campo, operador, valor, tipo] = filtro;

                // '=' -> 'eq'
                const operadorInterpretado = this.signalToLetter[operador] || operador;

                if (!this.validSignals.includes(operadorInterpretado)) {
                    throw new InvalidOperator(`Operador comparativo "${operadorInterpretado}" inválido. Seu filtro está correto?`).stack
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

}

module.exports = {
    MagnusBilling
}

// NOTE TO SELF: ~1500 linhas de código no modelo antigo
// NOTE TO SELF: ~???? linhas de código com a implementação do createEndpoint (fazer)