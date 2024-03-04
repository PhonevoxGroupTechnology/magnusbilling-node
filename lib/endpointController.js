const { InvalidOperator, Denied, ValidatingError, FindError, ExpectedArgumentMisuse, ExpectedArgumentMissingArg, ExpectedArgumentTooManyArguments, ExpectedArgumentArgumentNotAllowed } = require('./errors.js');

async function createEndpoint(mb, module, action, ArgumentObject) {
    return async (data) => {

        if (data.module | data.action ) { throw new Denied('Espertinho. Não repasse "action" nem "module".').stack }

        console.log('[CE] Data received: ');
        console.log(data);
        
        console.log('[CE] Interpreting expects...');
        if (ArgumentObject.expects) { await interpretExpectations(data, ArgumentObject.expects) } else { console.log('[CE] No expects found.') };

        console.log('[CE] Obtaining user arguments: ')
        ArgumentObject.payload.userArguments = await findUserArguments(data, ArgumentObject.payload)
        console.log(ArgumentObject.payload.userArguments)


        console.log('[CE] Building your payload structure...')
        let payload = {}
        payload = await interpretPayloadArgs(ArgumentObject.payload, payload, data)

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
                mb.interpretFilters(data.filtro)  // <-- this is a problem
                let r = await mb.read(module)     // <-- this is a problem
                mb.clearFilter()                  // <-- this is a problem
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

async function findUserArguments(dataObject, args) {
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

async function addFixedArgs(fixedArgs, payload) {
    // Adicionando a parte fixada da payload
    
    for (const [fixArg, value] of Object.entries(fixedArgs)) {
        console.log('[CE] Iterating FIXED arg: ' + fixArg)
        payload[fixArg] = value;
    }

    return payload;
}

async function addDefaultArgs(defaultArgs, payload, data) {
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

async function addUserArgs(userArgs, payload, data) {
    userArgs.forEach(usrArg => {
        console.log('[CE] Iterating USER ARGUMENT: ' + usrArg)
        if (data[usrArg]) {
            payload[usrArg] = data[usrArg]
        }
    })
    return payload
} 

async function interpretExpectations(dataArray, expects) {
    expects.forEach(expectation => {
        const { args, logic } = expectation;
        _ExpectedArgs(dataArray, args, logic)
    });
}

async function _ExpectedArgs(data, expectedArgs, condition = "AND") {
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

async function interpretPayloadArgs(payloadArgs, payload, data) {
    if (!payloadArgs) { console.log('[CE] No payload args.'); return {} }
        
    console.log('\n[CE] Adding fixeds....')
    if (payloadArgs.fixed) {
        payload = await addFixedArgs(payloadArgs.fixed, payload)
    } else { console.log('[CE] No fixed args found.') }
    console.log('[CE] Payload post-fixed: ' + JSON.stringify(payload))

    console.log('\n[CE] Adding defaults...')
    if (payloadArgs.default) {
        payload = await addDefaultArgs(payloadArgs.default, payload, data)
    } else { console.log('[CE] No default args found.') }
    console.log('[CE] Payload post-default: ' + JSON.stringify(payload) + '\n')

    console.log('\n[CE] Adding user arguments...')
    if (payloadArgs.userArguments) {
        payload = await addUserArgs(payloadArgs.userArguments, payload, data)
    } else { console.log('[CE] No user args found.') }
    console.log('[CE] Payload post-userArgs: ' + JSON.stringify(payload))

    return payload
}

module.exports = {
    findUserArguments,
    addFixedArgs,
    addDefaultArgs,
    addUserArgs,
    interpretExpectations,
    _ExpectedArgs,
    interpretPayloadArgs,
    createEndpoint
}