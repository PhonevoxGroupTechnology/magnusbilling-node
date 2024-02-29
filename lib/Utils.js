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

module.exports = {
    interpretarOperador,
    isFloat
}