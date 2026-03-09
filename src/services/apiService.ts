import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30s timeout for AI calls
});

// ─── Response Types ────────────────────────────────────────────────────────────

export interface RunResponse {
    status: string;
    stdout: string;
    stderr: string;
    exitCode: number | null;
}

export interface AnimationStep {
    line: number;
    action:
    | 'create_variable'
    | 'update_variable'
    | 'create_array'
    | 'update_array'
    | 'swap'
    | 'loop_iteration'
    | 'function_call'
    | 'function_return'
    | 'stack_push'
    | 'stack_pop'
    | 'input'
    | 'output'
    | string;
    variable?: string;
    value?: unknown;
    expression?: string;
    message?: string;
    /** Step-level AI explanation shown in the tutor panel */
    explanation?: string;
    array?: string;
    index?: number;
    swapWith?: number;
    functionName?: string;
}

export interface AnalyzeResponse {
    status: string;
    /** Overall code explanation */
    explanation: string;
    steps: AnimationStep[];
}

export interface AnimateResponse {
    status: string;
    steps: AnimationStep[];
}

// ─── Error Formatting ──────────────────────────────────────────────────────────

function formatError(err: unknown): string {
    if (err instanceof AxiosError) {
        const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message;
        return msg ?? 'Unknown network error';
    }
    if (err instanceof Error) return err.message;
    return String(err);
}

// ─── API Service ───────────────────────────────────────────────────────────────

export const apiService = {
    async runCode(code: string, language: string, input?: string): Promise<RunResponse> {
        try {
            const response = await api.post<RunResponse>('/run', { code, language, input });
            return response.data;
        } catch (err) {
            throw new Error(`[/api/run] ${formatError(err)}`);
        }
    },

    async analyzeCode(
        code: string,
        language: string,
        question?: string,
    ): Promise<AnalyzeResponse> {
        try {
            const response = await api.post<AnalyzeResponse>('/analyze', {
                code,
                language,
                question,
            });
            return response.data;
        } catch (err) {
            throw new Error(`[/api/analyze] ${formatError(err)}`);
        }
    },

    async getAnimation(code: string, language: string): Promise<AnimateResponse> {
        try {
            const response = await api.post<AnimateResponse>('/animate', { code, language });
            return response.data;
        } catch (err) {
            throw new Error(`[/api/animate] ${formatError(err)}`);
        }
    },
};
