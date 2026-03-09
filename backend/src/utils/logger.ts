export const logger = {
    info: (message: string, ...args: any[]) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
    },
    error: (message: string, error?: any) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
    },
    warn: (message: string) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    },
    debug: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args);
        }
    }
};
