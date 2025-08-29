import { Router } from 'express';
import routesController from './routes.routes';

const router = Router();

router.use('/routes', routesController);

export default router;


