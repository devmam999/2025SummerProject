import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getRouteSuggestions, refineRoute } from '../controllers/routes.controller';

const router = Router();

router.post('/suggestions', authenticate, getRouteSuggestions);
router.post('/refine', authenticate, refineRoute);

export default router;


