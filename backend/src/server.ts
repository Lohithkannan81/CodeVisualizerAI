import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';

// Routes
import executeRoutes from './routes/execute.routes';
import analyzeRoutes from './routes/analyze.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

// Middlewares
app.use(cors({
    origin: config.ALLOWED_ORIGINS
}));
app.use(express.json());
app.use(morgan('dev'));

// Route mounting
app.use('/api', executeRoutes);
app.use('/api', analyzeRoutes);
app.use('/api', aiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

const PORT = config.PORT;

app.listen(PORT, () => {
    logger.info(`Backend Server started on port ${PORT} in ${config.NODE_ENV} mode`);
    logger.info(`Ready to visualize code...`);
});
