var express = require('express'),
    router = express.Router();

var USER_ROUTE = require('./clients/user')
var SIP_ROUTE = require('./clients/sip')

router
    .get('/', function () { })
    .use('/clients', USER_ROUTE)
    .use('/clients', SIP_ROUTE)

    // Tratamento de erros genêrico
    .use((err, req, res, next) => {
        res.status(500).json({
            status: 'error',
            type: 'Internal Server Error',
            code: 500,
            message: 'Ocorreu um erro durante o processamento da sua solicitação. Por favor, tente novamente mais tarde.'
        });
    })

module.exports = router;