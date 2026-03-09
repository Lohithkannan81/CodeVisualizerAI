import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';

const router = Router();

router.post('/animate', aiController.animate);

export default router;
