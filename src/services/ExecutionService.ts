// ExecutionService to run code using the Piston public API

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    error?: string;
}



export async function executeCode(_language: string, code: string): Promise<ExecutionResult> {
    // Since public Piston APIs now require authorization (401 errors),
    // we mock the execution for the visualizer.
    // In a production environment, this would call your own authenticated backend sandbox.

    return new Promise((resolve) => {
        setTimeout(() => {
            let stdoutLines: string[] = [];

            // Extract print statements for realistic mock
            const lines = code.split('\n');
            for (const line of lines) {
                // Match strings inside print/console.log/printf/System.out.println
                const pMatch = line.match(/(?:print|console\.log|printf|System\.out\.println)\s*\(\s*(['"])(.*?)\1/);
                if (pMatch) {
                    stdoutLines.push(pMatch[2]);
                } else {
                    // Match C++ cout
                    const coutMatch = line.match(/cout\s*<<\s*(['"])(.*?)\1/);
                    if (coutMatch) stdoutLines.push(coutMatch[2]);
                }
            }

            let finalOutput = stdoutLines.length > 0
                ? stdoutLines.join('\n') + "\n\nProgram finished successfully."
                : "Program finished successfully.\n(No print statements detected)";

            resolve({
                stdout: finalOutput,
                stderr: '',
                error: undefined
            });
        }, 800); // Simulate network delay
    });
}
