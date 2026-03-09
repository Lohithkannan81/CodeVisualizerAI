import { Request, Response, NextFunction } from 'express';
import { executionService } from '../services/execution.service';
import { logger } from '../utils/logger';

export const executeController = {
    async run(req: Request, res: Response, next: NextFunction) {
        try {
            const { code, language, input } = req.body;

            if (!code || !language) {
                return res.status(400).json({ status: 'error', message: 'Code and language are required' });
            }

            logger.info(`Running ${language} code...`);
            const result = await executionService.runCode(code, language, input);

            res.json({
                status: 'success',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
};
