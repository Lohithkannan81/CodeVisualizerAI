import { Router } from 'express';
import { executeController } from '../controllers/execute.controller';

const router = Router();

router.post('/run', executeController.run);

export default router;
