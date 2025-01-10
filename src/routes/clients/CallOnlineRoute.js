import { Router } from 'express';
import CallOnlineController from '../../controllers/clients/CallOnlineController.js';
const router = Router();

router.get('/callonline', CallOnlineController.query)
router.get('/callonline/id/:id', CallOnlineController.query)
router.get('/callonline/iduser/:id_user', CallOnlineController.query)

router.post('/callonline/spy', CallOnlineController.spy)

router.delete('/callonline', CallOnlineController.hangup)

export default router;