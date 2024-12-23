import { Router } from 'express';
import CalleridController from '../../controllers/clients/CalleridController.js';
const router = Router();

router.post('/callerid', CalleridController.create)

router.get('/callerid/rules', CalleridController.getRules) // has to be above param routes (/:id)
router.get('/callerid', CalleridController.query)
router.get('/callerid/id/:id', CalleridController.query)
router.get('/callerid/:cid', CalleridController.query)

router.put('/callerid/:cid', CalleridController.update)
router.put('/callerid/id/:id', CalleridController.update)

router.delete('/callerid/:cid', CalleridController.delete)
router.delete('/callerid/id/:id', CalleridController.delete)

export default router;