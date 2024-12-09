import { Router } from 'express';
import UserController from '../../controllers/clients/UserController.js';
const router = Router();

const Controller = new UserController();

router.post('/user', Controller.create)
router.get('/user', Controller.get)
router.get('/user/rules', Controller.getRules) // this has to be above the /:id routes, else it will treat as id
router.get('/user/:id', Controller.getById)
router.put('/user/:id', Controller.update)
router.delete('/user/:id', Controller.delete)

export default router;