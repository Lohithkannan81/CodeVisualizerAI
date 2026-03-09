import { Request, Response, NextFunction } from 'express';
import { openaiService } from '../services/openai.service';
import { logger } from '../utils/logger';

export const analyzeController = {
    async analyze(req: Request, res: Response, next: NextFunction) {
        try {
            const { code, language, question } = req.body;

            if (!code || !language) {
                return res.status(400).json({ status: 'error', message: 'Code and language are required' });
            }

            logger.info(`Analyzing ${language} code with AI...`);
            const result = await openaiService.analyzeCode(code, language, question);

            res.json({
                status: 'success',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
};
