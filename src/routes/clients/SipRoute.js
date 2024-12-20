import { Router } from 'express';
import SipController from '../../controllers/clients/SipController.js';
const router = Router();

router.post('/sip', SipController.create)

router.get('/sip/rules', SipController.getRules) // has to be above param routes (/:id)
router.get('/sip', SipController.query)
router.get('/sip/id/:id', SipController.query)
router.get('/sip/:defaultuser', SipController.query)

router.put('/sip/:defaultuser', SipController.update)
router.put('/sip/id/:id', SipController.update)

router.delete('/sip/:defaultuser', SipController.delete)
router.delete('/sip/id/:id', SipController.delete)

export default router;