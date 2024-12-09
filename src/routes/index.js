import { Router } from 'express';
import magnus_route from '../controllers/MagnusController.js';
import MagnusController from '../controllers/MagnusController.js';
const Controller = new MagnusController();

const router = Router();
router.use('/magnus/testuser', Controller.testUser);
// router.use('/magnus/outracoisa', Controller.outracoisa);

export default router