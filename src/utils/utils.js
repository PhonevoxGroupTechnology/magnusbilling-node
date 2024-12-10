import { createHash } from 'crypto';
import { z } from 'zod';

// this is REALLY simplified.
export const zodToJson = (zodSchema) => {
    const schemaDetails = {};

    // Função recursiva para processar cada campo
    const processField = (field) => {
        const fieldDetails = {};

        // Verificando se o campo é opcional
        if (field instanceof z.ZodOptional) {
            fieldDetails.required = false;
            field = field._def.innerType;  // Vamos pegar o tipo "interno" para continuar o processamento
        } else {
            fieldDetails.required = true;  // Definido como "required" por padrão
        }

        // Verificando se o campo é um número (inteiro ou não)
        if (field instanceof z.ZodNumber) {
            fieldDetails.type = "number";

            if (field._def.checks) {
                field._def.checks.forEach((check) => {
                    if (check.kind === "int") {
                        fieldDetails.integer = true;
                    }
                    if (check.kind === "min") {
                        fieldDetails.min = check.value;
                    }
                    if (check.kind === "max") {
                        fieldDetails.max = check.value;
                    }
                    if (check.kind === "gte") {
                        fieldDetails.gte = check.value;
                    }
                    if (check.kind === "lte") {
                        fieldDetails.lte = check.value;
                    }
                });
            }
        }

        // Verificando se o campo é uma string
        if (field instanceof z.ZodString) {
            fieldDetails.type = "string";

            if (field._def.checks) {
                field._def.checks.forEach((check) => {
                    if (check.kind === "min") {
                        fieldDetails.minLength = check.value;
                    }
                    if (check.kind === "max") {
                        fieldDetails.maxLength = check.value;
                    }
                    if (check.kind === "email") {
                        fieldDetails.email = true;
                    }
                });
            }
        }

        // Tratando valores padrões
        if (field instanceof z.ZodDefault) {
            fieldDetails.default = field._def.defaultValue();
        }

        return fieldDetails;
    };

    // Processando o esquema Zod
    const shape = zodSchema._def.shape();

    for (const key in shape) {
        const field = shape[key];
        const fieldDetails = processField(field);
        schemaDetails[key] = fieldDetails;
    }

    return schemaDetails;
};



export const sha256 = (x, y = {digest: hex}) => {
    let hash = createHash('sha256').update(x);
    switch (y.digest) {
        case "hex":
            return hash.digest('hex');
        case "base64":
            return hash.digest('base64');
        default:
            throw new Error("Unknown digest");
    }
}

export const envBool = (param) => {
    return (String(param).toLowerCase() === 'true');
}

export const interpretarOperador = (op) => {
    switch (op) {
        case '=':
            return 'eq';
        case '>':
            return 'gt';
        case '<':
            return 'lt';
        // Adicione outros operadores conforme necessário
        default:
            return op;
    }
}

export const arrayHasKey = (obj, keyName) => {
    if (Object.keys(obj).indexOf(keyName) !== -1) {
        return true;
    } else {
        return false;
    }
};

export const isFloat = (value) => {
    if (
      typeof value === 'number' &&
      !Number.isNaN(value) &&
      !Number.isInteger(value)
    ) {
      return true;
    }
  
    return false;
}

export const isSet = (value) => {
    return value !== undefined && value !== null;
}

export const createNonce = () => {
    const mt = new Date().getTime().toString();
    return mt.slice(-10) + mt.substr(2, 6);
}

export const getQueryString = (request) => {
    return new URLSearchParams(request).toString()
}

export const mergeObjects = (rule1, rule2) => {
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

// Usando o simplificado, gera uma tabela markdown.
export const createMDTable = (obj) => {

    let emptyCell = "-"
    let markdownTable = "Key | Required | Default | Type | Min | Max \n"
    markdownTable += "--- | --- | --- | --- | --- | ---\n";

    // generate the "type" column based on present keys
    const getType = (argument) => {

        if (argument.numerical && argument.integerOnly) {
            return "integer";
        }
        if (argument.numerical && ! argument.integerOnly) {
            return "number";
        }
        if (argument.type) {
            return argument.type;
        }

        return "string"; // i am not sure: we didnt find a specific type, so im assuming string
    }

    // generate the "default" column based on present keys
    const getDefault = (argument) => {

        if (argument.default) {
            return argument.default
        }

        if (argument.fixed) {
            return `${argument.fixed} (immutable)`
        }

        return emptyCell;
    }


    // preparing each row data
    let rows = [];
    for (const key in obj) {
        const required = obj[key].required ? "yes" : "no";
        const default_value = getDefault(obj[key])
        const type = getType(obj[key]);
        const min = obj[key].minLength ? obj[key].minLength : emptyCell;
        const max = obj[key].maxLength ? obj[key].maxLength : emptyCell;
        rows.push({ key, required, default_value, type, min, max });
    }

    // sorting rows
    rows.sort((a, b) => {
        if (a.required === b.required) {
            return a.key.localeCompare(b.key); // Ordena por key se required for igual
        }
        return a.required === "yes" ? -1 : 1; // "yes" vem antes de "no"
    });
    
    // generating table
    for (const row of rows) {
        markdownTable += `${row.key} | ${row.required} | ${row.default_value} | ${row.type} | ${row.min} | ${row.max}\n`;
    }

    return markdownTable

}
