// Express
var express = require('express');
router = express.Router();

// NAO QUERIA FAZER ISSO 💀 MAS NAO SEI COMO REPASSAR ESSAS FUNÇÕES/CLASSE DE OUTRA FORMA. REVER ISSO
// (Definir "mb" em server.js, e acessar aqui. Idem para "log" e "ilog")
const { mb } = require('../../configs/magnus');          // Magnus Connection
const { generateLogger } = require('../../configs/log'); // Logging
var log = generateLogger('User', './logs/express', 10, 10);

router
    .post('/user/add', async function(req, res){
        log.debug(`${req.logPrefix}`)
        let ret = await mb.clients.users.add(req.body)
        .then(ret => {
            log.info('Sucesso! ' + ret)
        })
        .catch(err => {
            res.status(500).json({
                success: 'false',
                message: err
            })
        })
        res.status(200).json({status: 'test'});
    })

    .get('/user/list', async function(req, res){
        log.debug(`${req.logPrefix}`)
        res.status(200).json({status: 'test'});
    })

    .get('/user/find', async function(req, res){
        log.debug(`${req.logPrefix}`)
        res.status(200).json({status: 'test'});
    })
 
module.exports = router;