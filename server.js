var cors = require('cors')
const bodyParser = require('body-parser');
const { default: helmet } = require('helmet');
const { performChecks, expects, ratelimit_auth, ratelimit_route, setLogPrefix } = require('./src/configs/middleware');
const { generateLogger } = require('./src/configs/log');

// Express
const ex = require('express')
const app = ex()
const PORT = 3000

app.use(cors())
app.use(bodyParser.json());
app.use(helmet());
// app.use('/', ratelimit_auth);
app.use('/', ratelimit_route);

// Middleware de tratamento de erros genérico
app.use((err, req, res, next) => {
    console.error(err.stack); // Log do erro para fins de depuração
    console.error(err);

    // Retornar uma resposta de erro genérica para o cliente
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro durante o processamento da sua solicitação. Por favor, tente novamente mais tarde.'
    });
});


// Inicializando o Log.
let log = generateLogger('main-log', './logs/express', 10, 10);
let ilog = generateLogger('internal-log', './logs/express', 10, 10);

app.get('/', performChecks, setLogPrefix, (req, res) => {
    res.send('Hello World!')
    log.debug(`${req.logPrefix}`)
    log.test('batata') 
    ilog.test('batata 2')
})

app.listen(PORT, () => {
    console.log(`<#@#> Express ativo na porta ${PORT} <#@#>`)
})