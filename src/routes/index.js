import { Router } from 'express';
import routerUser from './clients/UserRoute.js';
import routerTest from './tests/TestRoute.js'

const router = Router();

router.use('/clients', routerUser);
router.use('/tests', routerTest)

export default function getRouter() {
    return router;
}
