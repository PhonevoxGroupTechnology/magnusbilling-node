import { Router } from 'express';
import routerUser from './clients/UserRoute.js';

const router = Router();

router.use('/clients', routerUser);

export default function getRouter() {
    return router;
}
