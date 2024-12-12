import 'dotenv/config';
import Logger from './src/utils/logging.js';
import express from 'express';
import cors from 'cors';
import { setLogPrefix } from './src/middlewares/Utility.js';

import getRouter from './src/routes/index.js';
const logger = new Logger('app', false).useEnvConfig().create()

const app = express();
app.use(cors());
app.use(express.json());
app.use(setLogPrefix)
app.use('/api', getRouter());

if (process.env.NODE_ENV !== 'test') {
    app.listen(process.env.EXPRESS_PORT, () => {
        logger.info(`Server is running on port ${process.env.EXPRESS_PORT}`);
    });
}

export default app; // export so it can be used as test