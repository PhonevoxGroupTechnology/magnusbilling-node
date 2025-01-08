import { Router } from 'express';
import RestrictedNumberController from '../../controllers/clients/RestrictedNumberController.js';
const router = Router();

router.post('/restrictednumber', RestrictedNumberController.create)

router.get('/restrictednumber/rules', RestrictedNumberController.getRules) // has to be above param routes (/:id)
router.get('/restrictednumber', RestrictedNumberController.query)
router.get('/restrictednumber/id/:id', RestrictedNumberController.query)
// router.get('/restrictednumber/:number', RestrictedNumberController.query) // :number is not unique. the only unique field is id

// router.put('/restrictednumber/:number', RestrictedNumberController.update) // :number is not unique. the only unique field is id
router.put('/restrictednumber/id/:id', RestrictedNumberController.update)

// router.delete('/restrictednumber/:number', RestrictedNumberController.delete) // :number is not unique. the only unique field is id
router.delete('/restrictednumber/id/:id', RestrictedNumberController.delete)

export default router;