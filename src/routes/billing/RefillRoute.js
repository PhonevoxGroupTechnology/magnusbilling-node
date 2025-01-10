import { Router } from 'express';
import RefillController from '../../controllers/billing/RefillController.js';
const router = Router();

router.post('/sipuras', RefillController.create)

router.get('/sipuras/rules', RefillController.getRules) // has to be above param routes (/:id)
router.get('/sipuras', RefillController.query)
router.get('/sipuras/id/:id', RefillController.query)
router.get('/sipuras/:nserie', RefillController.query)

router.put('/sipuras/:nserie', RefillController.update)
router.put('/sipuras/id/:id', RefillController.update)

router.delete('/sipuras/:nserie', RefillController.delete)
router.delete('/sipuras/id/:id', RefillController.delete)

export default router;