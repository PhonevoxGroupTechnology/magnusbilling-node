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

module.exports = {
    interpretarOperador,
    isFloat,
    arrayHasKey,
    isSet,
    createNonce,
    getQueryString,
    sha256,
    envBool
}