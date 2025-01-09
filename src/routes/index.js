import { Router } from 'express';
import routerUser from './clients/UserRoute.js';
import routerSip from './clients/SipRoute.js';
import routerCallerid from './clients/CalleridRoute.js';
import routerSipuras from './clients/AtalinksysRoute.js';
import routerIax from './clients/IaxRoute.js';
import routerRestrictedNumber from './clients/RestrictedNumberRoute.js';
import routerUserHistory from './clients/UserHistoryRoute.js';
import routerCallOnline from './clients/CallOnlineRoute.js';
import routerTest from './tests/TestRoute.js';
import { handleUnexpected } from '../middlewares/ErrorHandler.js';

const router = Router();

router.use('/clients', routerCallOnline);
router.use('/clients', routerUserHistory);
router.use('/clients', routerRestrictedNumber); // essa bosta nao tem regras de api, tem que fazer lógica pra isso
router.use('/clients', routerIax);
router.use('/clients', routerSipuras);
router.use('/clients', routerCallerid);
router.use('/clients', routerUser);
router.use('/clients', routerSip);
router.use('/tests', routerTest)
router.use(handleUnexpected)

export default function getRouter() {
    return router;
}
