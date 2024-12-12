import { Router } from 'express';
import MagnusController from '../../controllers/MagnusController.js'
const router = Router();

router.post('/query', MagnusController._testQuery)
router.post('/rules/:module', MagnusController._getParsedRule)

export default router