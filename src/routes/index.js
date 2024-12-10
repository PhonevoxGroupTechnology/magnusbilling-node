import { Router } from 'express';
import routerUser from './clients/UserRoute.js';
import routerTest from './tests/TestRoute.js'
import { handleUnexpected } from '../middlewares/ErrorHandler.js';

const router = Router();

router.use('/clients', routerUser);
router.use('/tests', routerTest)
router.use(handleUnexpected)

export default function getRouter() {
    return router;
}
