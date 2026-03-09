import OpenAI from 'openai';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

export interface AnimationStep {
    line: number;
    action: string;
    variable?: string;
    value?: any;
    expression?: string;
    message?: string;
    array?: string;
    index?: number;
    swapWith?: number;
}

export interface AnalysisResult {
    explanation: string;
    steps: AnimationStep[];
}

export const openaiService = {
    async analyzeCode(code: string, language: string, question?: string): Promise<AnalysisResult> {
        try {
            const systemPrompt = `
        You are an AI programming visualization engine. 
        Analyze the provided code and generate step-by-step animation instructions for a 3D visualization engine.
        
        Return a JSON object with:
        - "explanation": A clear, concise explanation of the code's logic.
        - "steps": An array of objects, each representing an execution step.
        
        Each step must have:
        - "line": The 1-based line number in the source code.
        - "action": One of: "create_variable", "update_variable", "array_create", "array_insert", "array_swap", "loop_iteration", "condition_check", "function_call", "function_return", "print_output", "input".
        - Additional fields based on action:
          - create_variable/update_variable: "variable", "value"
          - array_create: "variable", "value" (array literal)
          - array_insert: "variable", "index", "value"
          - array_swap: "variable", "index", "swapWith"
          - condition_check: "expression"
          - print_output: "message"
          - input: "variable"
        
        Supported languages: Python, C, C++, Java, JavaScript.
        Be extremely precise with line numbers.
      `.trim();

            const userContent = `
        Language: ${language}
        Code:
        \`\`\`
        ${code}
        \`\`\`
        ${question ? `User Question: ${question}` : ''}
      `.trim();

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("No response content from OpenAI");

            return JSON.parse(content) as AnalysisResult;
        } catch (error) {
            logger.error("OpenAI analysis failed", error);
            throw error;
        }
    }
};
