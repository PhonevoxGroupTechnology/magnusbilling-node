import { Router } from 'express';
import AtalinksysController from '../../controllers/clients/AtalinksysController.js';
const router = Router();

router.post('/sipuras', AtalinksysController.create)

router.get('/sipuras/rules', AtalinksysController.getRules) // has to be above param routes (/:id)
router.get('/sipuras', AtalinksysController.query)
router.get('/sipuras/id/:id', AtalinksysController.query)
router.get('/sipuras/:nserie', AtalinksysController.query)

router.put('/sipuras/:nserie', AtalinksysController.update)
router.put('/sipuras/id/:id', AtalinksysController.update)

router.delete('/sipuras/:nserie', AtalinksysController.delete)
router.delete('/sipuras/id/:id', AtalinksysController.delete)

export default router;