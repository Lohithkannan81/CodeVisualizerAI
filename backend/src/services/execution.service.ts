import { spawn } from 'child_process';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { tmpdir } from 'os';

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
}

export const executionService = {
    async runCode(code: string, language: string, input?: string): Promise<ExecutionResult> {
        return new Promise((resolve, reject) => {
            const fileName = `temp_${Date.now()}`;
            let command = '';
            let args: string[] = [];
            let tempFile = '';

            const workDir = tmpdir();

            switch (language.toLowerCase()) {
                case 'python':
                    tempFile = path.join(workDir, `${fileName}.py`);
                    fs.writeFileSync(tempFile, code);
                    command = 'python';
                    args = [tempFile];
                    break;
                case 'javascript':
                    tempFile = path.join(workDir, `${fileName}.js`);
                    fs.writeFileSync(tempFile, code);
                    command = 'node';
                    args = [tempFile];
                    break;
                case 'c':
                case 'cpp':
                    // C/C++ requires compilation first. This is a simplified version.
                    // Note: gcc/g++ must be in PATH.
                    const ext = language === 'c' ? 'c' : 'cpp';
                    const srcPath = path.join(workDir, `${fileName}.${ext}`);
                    const exePath = path.join(workDir, `${fileName}.exe`);
                    fs.writeFileSync(srcPath, code);

                    const compiler = language === 'c' ? 'gcc' : 'g++';
                    const compile = spawn(compiler, [srcPath, '-o', exePath]);

                    compile.on('close', (code) => {
                        if (code !== 0) {
                            resolve({ stdout: '', stderr: 'Compilation Error', exitCode: code });
                            return;
                        }
                        this.executeBinary(exePath, input).then(resolve).catch(reject);
                    });
                    return;
                default:
                    reject(new Error(`Language ${language} not supported for execution`));
                    return;
            }

            this.executeBinary(command, input, args).then(resolve).catch(reject);
        });
    },

    async executeBinary(command: string, input?: string, args: string[] = []): Promise<ExecutionResult> {
        return new Promise((resolve) => {
            const child = spawn(command, args);
            let stdout = '';
            let stderr = '';

            if (input) {
                child.stdin.write(input);
                child.stdin.end();
            }

            child.stdout.on('data', (data) => { stdout += data.toString(); });
            child.stderr.on('data', (data) => { stderr += data.toString(); });

            child.on('close', (code) => {
                resolve({ stdout, stderr, exitCode: code });
            });

            // Timeout safety
            setTimeout(() => {
                child.kill();
                resolve({ stdout, stderr: stderr + '\n[Timeout Error]', exitCode: -1 });
            }, 5000);
        });
    }
};
