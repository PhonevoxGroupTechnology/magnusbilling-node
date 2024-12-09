import { Router } from 'express';
import MagnusController from '../controllers/MagnusController.js';
const router = Router();

const Controller = new MagnusController();

router.post('/test', Controller.testUser)

export default router