import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
    PORT: process.env.PORT || 4000,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
};

if (!config.OPENAI_API_KEY && config.NODE_ENV === 'production') {
    console.warn('WARNING: OPENAI_API_KEY is not set in production environment');
}
