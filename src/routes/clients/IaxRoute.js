import { Router } from 'express';
import IaxController from '../../controllers/clients/IaxController.js';
const router = Router();

router.post('/iax', IaxController.create)

router.get('/iax/rules', IaxController.getRules) // has to be above param routes (/:id)
router.get('/iax', IaxController.query)
router.get('/iax/id/:id', IaxController.query)
router.get('/iax/:username', IaxController.query)

router.put('/iax/:username', IaxController.update)
router.put('/iax/id/:id', IaxController.update)

router.delete('/iax/:username', IaxController.delete)
router.delete('/iax/id/:id', IaxController.delete)

export default router;