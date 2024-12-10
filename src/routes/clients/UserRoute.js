import { Router } from 'express';
import UserController from '../../controllers/clients/UserController.js';
const router = Router();

router.post('/user', UserController.create)
router.get('/user', UserController.get)
router.get('/user/rules', UserController.getRules) // this has to be above the /:id routes, else it will treat as id
router.get('/user/:id', UserController.getById)
router.put('/user/:id', UserController.update)
router.delete('/user/:id', UserController.delete)

export default router;