const { MagnusBilling } = require("./index");
const { API_KEY, API_SECRET, MAGNUS_HOST } = require("./auth")
// 1 = critical, 2 = error, 3 = warning, 4 = info, 5 = debug, 6 = trace
const DEBUG_LEVEL = 10;

const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST, DEBUG_LEVEL);

// Realmente recomendo que utilize o método ".list" nos endpoints, para descobrir os campos que pode repassar!
// Está convidado à olhar o código fonte (./lib/endpoints/{endpoint_folder}/{endpoint_file}) para ver outras formas que pode repassar alguns campos. (Somente em alguns endpoints)

// Arquivo de log do MagnusBilling: /var/www/html/mbilling/protected/runtime/application.log
// 2024/02/24 13:25:13 [error] [php] Undefined index: id (/var/www/html/mbilling/protected/components/ApiAccess.php:176)
// Significa que falta o campo "id" na payload

// Todas as informações neste arquivo são apenas para utilizar-se como exemplos da api. Este arquivo também é utilizado como teste prático para novos ///desenvolvimentos.

function processArguments(data, outputType) {
    
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
        case 'simplified':
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
            throw new Error('Tipo de output não aceito!')
    }
}

const mergeRules = (rule1, rule2) => {
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

async function test(endpoint, outputType) {
    // um crime contra a humanidade.
    await mb.getFields(endpoint)
    .then(res => {
        retorno = processArguments(res, outputType)
        let test = {
        }
        // console.log(retorno)
        // console.log(test)
        console.log(mergeRules(retorno, test))
        return true
    }).catch(err => {
        throw new Error("Erro na promise! " + err).stack
    })
}

// ------------------------------------------- TEST AREA -------------------------------------------

// mb.echoResponse = false;
// // mb.echoResponse = true;
// let todoModules = ['rate']
// // Módulo "rate": Não pode GetFields --> PUSH THROUGH BROTHERS!
// // Módulo "trunkGroup": Não pode getFields? erro 401 --> só prosseguir com oq a web faz
// const randomIndex = Math.floor(Math.random() * todoModules.length);
// const randomModule = todoModules[randomIndex];

// // // mb.getModules()

// test(randomModule, 'simple')
// .catch(err => console.error(err) )
// console.log('<:@:> Módulo: ' + randomModule + ' <:@:>')

// ------------------------------------------- --------- -------------------------------------------

// id_user : 11
mb.echoResponse = true;

mb.rates.tariffs.list({
    id_plan: 1,
    id_trunk_group: 1,
    id_prefix: 1
})
.catch(err => {
    console.log(err)
})


// to-do: refazer TODOS endpoints porque mudei a forma de como repasso os argumentos pra eles. tome como base trunks.js
