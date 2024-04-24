var cors = require('cors')
const bodyParser = require('body-parser');
const { default: helmet } = require('helmet');
const { performChecks, expects, ratelimit_auth, ratelimit_route, setLogPrefix } = require('./src/configs/middleware');
var ROUTES = require('./src/routes/routing')

// Inicializando o Log.
const { generateLogger } = require('./src/configs/log');
let log = generateLogger('main-log', './logs/express', 10, 10);
let ilog = generateLogger('internal-log', './logs/express', 10, 10);

// Express
const express = require('express')
const app = express()
const PORT = 3000

app.use(cors())
app.use(bodyParser.json());
app.use(helmet());
app.use('/', ratelimit_route, setLogPrefix, ROUTES)
// Middleware para adicionar log e ilog ao objeto req
app.use((req, res, next) => {
    req.log = log;
    req.ilog = ilog;
    next();
});


// Setando todas as rotas

// Inicializando o servidor
app.listen(PORT, () => {
    console.log(`<#@#> Express ativo na porta ${PORT} <#@#>`)
})
