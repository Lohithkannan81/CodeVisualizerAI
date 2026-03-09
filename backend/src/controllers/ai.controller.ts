import { Request, Response, NextFunction } from 'express';
import { openaiService } from '../services/openai.service';
import { animationService } from '../services/animation.service';

export const aiController = {
    async animate(req: Request, res: Response, next: NextFunction) {
        try {
            const { code, language } = req.body;

            if (!code || !language) {
                return res.status(400).json({ status: 'error', message: 'Code and language are required' });
            }

            // Re-using analyzeCode but potentially focusing only on animation steps
            const result = await openaiService.analyzeCode(code, language);
            const refinedSteps = animationService.processSteps(result.steps);

            res.json({
                status: 'success',
                steps: refinedSteps
            });
        } catch (error) {
            next(error);
        }
    }
};
