const path = require("path");
const { createHash } = require("crypto");
const { Logger } = require( path.resolve("src/util/logging") );

function sha256(x, y = {digest: hex}) {
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

function envBool(param) {
    return (String(param).toLowerCase() === 'true');
}


function interpretarOperador(op) {
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

const arrayHasKey = (obj, keyName) => {
    if (Object.keys(obj).indexOf(keyName) !== -1) {
        return true;
    } else {
        return false;
    }
};

function isFloat(value) {
    if (
      typeof value === 'number' &&
      !Number.isNaN(value) &&
      !Number.isInteger(value)
    ) {
      return true;
    }
  
    return false;
}

function isSet(value) {
    return value !== undefined && value !== null;
}

function createNonce() {
    const mt = new Date().getTime().toString();
    return mt.slice(-10) + mt.substr(2, 6);
}

function getQueryString(request) {
    return new URLSearchParams(request).toString()
}

function mergeObjects(rule1, rule2) {
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

module.exports = {
    interpretarOperador,
    isFloat,
    arrayHasKey,
    isSet,
    createNonce,
    getQueryString,
    sha256,
    envBool,
    mergeObjects
}