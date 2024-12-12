import { Router } from 'express';
import UserController from '../../controllers/clients/UserController.js';
const router = Router();

router.post('/user', UserController.create)

router.get('/user/rules', UserController.getRules) // this has to be above the /:id and /:username routes, or it will treat as id
router.get('/user', UserController.get)
router.get('/user/id/:id', UserController.get)
router.get('/user/:username', UserController.get) // i hate thisssssssssssssssssssssssss

router.put('/user/:username', UserController.update)
router.put('/user/id/:id', UserController.update)

router.delete('/user/:id', UserController.delete)

export default router;