
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

module.exports = {
    interpretarOperador,
    isFloat,
    arrayHasKey,
    isSet,
    createNonce,
}