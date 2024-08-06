class EndpointMethodManager {
    constructor(module) {
        this.module = module;
        this.methods = {};
        this.magnus = null;
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
        const rulesSummary = {};
        for (const [methodName, method] of Object.entries(this.methods)) {
            rulesSummary[methodName] = method.rules;
        }
        return rulesSummary;
    }
}

module.exports = EndpointMethodManager