import dotenv from 'dotenv';
import Logger from './src/utils/logging.js';
import express from 'express';
import cors from 'cors';
dotenv.config();

import getRouter from './src/routes/index.js';
const logger = new Logger('app', false).useEnvConfig().create()

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', getRouter());
app.listen(process.env.EXPRESS_PORT, () => {
    logger.info(`Server is running on port ${process.env.EXPRESS_PORT}`);
});