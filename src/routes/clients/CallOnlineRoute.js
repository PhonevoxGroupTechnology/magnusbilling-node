import { Router } from 'express';
import CallOnlineController from '../../controllers/clients/CallOnlineController.js';
const router = Router();

router.get('/callonline', CallOnlineController.list)
router.delete('/callonline', CallOnlineController.hangup)

export default router;