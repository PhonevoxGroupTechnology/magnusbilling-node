const path = require("path");
const { mergeObjects } = require(path.resolve("src/util/utils"));

class EndpointMethodManager {
    constructor(module) {
        this.module = module;
        this.methods = {};
        this.magnus = null;
        this.moduleRules = null; // module rules from magnus api
        return this;
    }

    // Função para extrair parâmetros da função como uma lista de strings
    _getParameterNames(func) {
        const functionAsString = func.toString();
        const result = functionAsString
            .slice(functionAsString.indexOf('(') + 1, functionAsString.indexOf(')'))
            .match(/([^\s,]+)/g);
        return result === null ? [] : result;
    }

    // obrigado chatgpt
    // Cria um handler com o contexto correto
    _createHandler(originalHandler, action, rules) {
        // Extrai os nomes dos parâmetros da função `originalHandler`
        const parameterNames = this._getParameterNames(originalHandler);

        // Função wrapper para lidar com os parâmetros dinamicamente
        return (data) => {
            const args = [data];

            // Checa e binda os parâmetros com base na presença dos nomes na função `originalHandler`
            if (parameterNames.includes('magnus')) {args.push(this.magnus)};
            if (parameterNames.includes('module')) {args.push(this.module)};
            if (parameterNames.includes('action')) {args.push(action)};
            if (parameterNames.includes('rules')) {args.push(rules)};

            // Chama o handler original com os argumentos apropriados
            return originalHandler(...args);
        };
    }

    // Para que a classe "MagnusBilling" funcione no <method>.handle(), é preciso bindá-la aqui.
    // Isso é usado pelo EndpointManager. Não renomeie de forma alguma.
    _bindMagnusBilling(mb) {
        this.magnus = mb;

        return this;
    }

    // Os parametros "magnus, module, action, rules" são palavras reservadas. Não utilize-as como nome de argumentos na função.
    // endpoint.addMethod('add', {
    //     action: 'save', 
    //     rules: {a: "b"}, 
    //     handle: (YOUR_PARAMETER, magnus, module, action, rules) => {}
    // })
    addMethod(name, { action, rules, handle }) {
        if (this.methods[name]) {
            throw new Error(`Método '${name}' já existe.`);
        }

        // Armazena a função handler com o contexto apropriado
        this.methods[name] = {
            action,
            rules,
            handle: this._createHandler(handle, action, rules)
        };
        return this;
    }

    getMethod(name) {
        return this.methods[name];
    }
    
    getAllMethods() {
        const methodsSummary = {};
        for (const [methodName, method] of Object.entries(this.methods)) {
            methodsSummary[methodName] = method.handle;
        }
        return methodsSummary;
    }

    getAllRules() {
    
        // combine all method's rules with the api's rules
        const combineMethodRulesWith = (moduleRules) => {
            const rulesSummary = {};
            console.log('Module rules: ', moduleRules);
    
            for (const [methodName, method] of Object.entries(this.methods)) {
                console.log(`Method name: ${methodName}`);
                console.log(`Method rules: ${JSON.stringify(method.rules)}`);
    
                rulesSummary[methodName] = mergeObjects(moduleRules, method.rules);
            }
            return rulesSummary;
        };
    
        // api rules do not exist yet, fetch, combine and return
        if (!this.moduleRules) {
            return this.getMagnusRules()
                .then((apiRules) => {
                    this.moduleRules = apiRules;
                    return combineMethodRulesWith(this.moduleRules); // Combina e retorna
                })
                .catch((error) => {
                    console.error('Error fetching or processing rules:', error);
                    throw error;
                });
        }
    
        // api rules already exist, combine and return
        return Promise.resolve(combineMethodRulesWith(this.moduleRules));
    }

    getMagnusRules() {
        return this.magnus.getFields(this.module)
        .then((data) => { // Usando uma arrow function para preservar o escopo de 'this'
            const formatted = this.magnus.formatApiRequirement(data, 'simple');
            return formatted;
        })
        .catch((error) => {
            console.error("Error fetching Magnus rules:", error);
            throw error; // Propaga o erro para ser tratado posteriormente
        });
    }

    test() {
        // mb.epm.<endpoint>.test
        // mb.epm.USER.test
        for (const [methodName, method] of Object.entries(this.methods)) {
            console.log(`Método: ${methodName}`);
            console.log(`Ação: ${method.action}`);
            console.log(`Regras: ${JSON.stringify(method.rules)}`);
            console.log(`Manipulador: ${method.handle.toString()}`);
            console.log('---');
        }
    }
}

module.exports = EndpointMethodManager