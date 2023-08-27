import express from 'express';
import dataProcessingController from '../controllers/dataProcessingController.js';

const dataRouter = express.Router();
dataRouter.get('/', dataProcessingController.getData);
dataRouter.post('/', dataProcessingController.sendSoalToMysqlServer);
dataRouter.post('/answer', dataProcessingController.sendJawabanToMysqlServer);

export default dataRouter;
