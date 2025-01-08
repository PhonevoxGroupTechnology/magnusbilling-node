import { Router } from 'express';
import UserHistoryController from '../../controllers/clients/UserHistoryController.js';
const router = Router();

router.post('/userhistory', UserHistoryController.create)

router.get('/userhistory/rules', UserHistoryController.getRules) // has to be above param routes (/:id)
router.get('/userhistory', UserHistoryController.query)
router.get('/userhistory/id/:id', UserHistoryController.query)
// router.get('/userhistory/:username', UserHistoryController.query)

// router.put('/userhistory/:username', UserHistoryController.update)
router.put('/userhistory/id/:id', UserHistoryController.update)

// router.delete('/userhistory/:username', UserHistoryController.delete)
router.delete('/userhistory/id/:id', UserHistoryController.delete)

export default router;