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

module.exports = {
    interpretarOperador
}