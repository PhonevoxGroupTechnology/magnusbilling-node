var express = require('express'),
router = express.Router();

const { mb } = require('../../configs/magnus');          // Magnus Connection
const { generateLogger } = require('../../configs/log'); // Logging
let log = generateLogger('/CLIENTS/USER', './logs/express', 10, 10);

router.get('/sip', function(req, res){
    res.status(200).json({status: 'sip'})
})
 
module.exports = router;