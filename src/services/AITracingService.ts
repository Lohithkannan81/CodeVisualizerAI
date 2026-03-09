import type { ExecutionStep } from '../examples';

// A mock service that simulates an AI generating an animation plan based on code structure.
export async function generateAITrace(code: string, _language: string): Promise<ExecutionStep[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lines = code.split('\n');
    const steps: ExecutionStep[] = [];

    let currentVariables: Record<string, any> = {};
    let currentArrays: any[] = [];
    let callStack: string[] = [];

    // Helper: create a step snapshot
    function makeStep(overrides: Partial<ExecutionStep> & { lineIndex: number; explanation: string }): ExecutionStep {
        return {
            variables: { ...currentVariables },
            arrays: JSON.parse(JSON.stringify(currentArrays)),
            callStack: [...callStack],
            ...overrides
        };
    }

    // Helper: resolve a value string to a number or keep as string
    function resolveValue(str: string): any {
        const trimmed = str.trim().replace(/;$/, '').replace(/['"]/g, '');
        if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
        if (currentVariables.hasOwnProperty(trimmed)) return currentVariables[trimmed];
        return trimmed || 'undefined';
    }

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = rawLine.trim();
        const lineIndex = i + 1;

        // Skip empty lines, comments, preprocessor directives, import/include
        if (!line) continue;
        if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue;
        if (line.startsWith('#')) continue; // #include, # comments in Python
        if (line.startsWith('import ') || line.startsWith('from ') || line.startsWith('using ')) continue;
        if (line === '{' || line === '}' || line === '};') {
            // Handle closing brace: pop call stack if we're inside a function
            if (line === '}' && callStack.length > 0) {
                callStack.pop();
            }
            continue;
        }

        // ==========================================
        // 1. FUNCTION DEFINITIONS
        // ==========================================
        // C/C++/Java: int main(), void foo(int x), etc.
        // Python: def foo():
        // JavaScript: function foo()
        const cFnMatch = line.match(/^(?:int|void|float|double|char|long|short|unsigned|string|bool|boolean|public\s+static\s+void|static\s+void)\s+([\w_]+)\s*\(/);
        const pyFnMatch = line.match(/^def\s+([\w_]+)\s*\(/);
        const jsFnMatch = line.match(/^(?:function|async\s+function)\s+([\w_]+)\s*\(/);

        if (cFnMatch || pyFnMatch || jsFnMatch) {
            const funcName = (cFnMatch || pyFnMatch || jsFnMatch)![1];
            callStack.push(`${funcName}()`);
            steps.push(makeStep({
                lineIndex,
                explanation: `Entering function ${funcName}(). Setting up stack frame.`,
                action: 'function_call',
                actionData: { name: funcName }
            }));
            continue;
        }

        // ==========================================
        // 2. INPUT (scanf, cin, input, Scanner)
        // ==========================================
        if (line.includes('scanf(') || line.includes('cin >>') || line.includes('input(') || line.includes('.nextInt') || line.includes('.nextLine') || line.includes('.next(')) {
            const scanMatch = line.match(/&\s*([\w_]+)/) ||          // C: scanf("%d", &n)
                line.match(/cin\s*>>\s*([\w_]+)/) ||    // C++: cin >> n
                line.match(/([\w_]+)\s*=\s*(?:int\s*\()?\s*input/) || // Python: n = int(input())
                line.match(/([\w_]+)\s*=\s*\w+\.next/); // Java: n = sc.nextInt()
            const varName = scanMatch ? scanMatch[1] : 'input';

            steps.push(makeStep({
                lineIndex,
                explanation: `⏸ Program paused. Waiting for user input for '${varName}'...`,
                inputRequired: true,
                action: 'update_variable',
                actionData: { name: varName }
            }));

            currentVariables[varName] = 0; // Placeholder until user provides input
            continue;
        }

        // ==========================================
        // 3. PRINTING (printf, print, cout, console.log, System.out)
        // ==========================================
        const printfMatch = line.match(/printf\s*\(\s*["'](.*?)["']\s*(?:,\s*(.*))?\)/);
        const pythonPrintMatch = line.match(/print\s*\(\s*(?:f?["'](.*?)["']|(.+?))\s*\)/);
        const coutMatch = line.match(/cout\s*<<\s*(?:["'](.*?)["']|([\w_]+))/);
        const consoleLogMatch = line.match(/console\.log\s*\(\s*(?:["'](.*?)["']|(.+?))\s*\)/);
        const sysOutMatch = line.match(/System\.out\.println?\s*\(\s*(?:["'](.*?)["']|(.+?))\s*\)/);

        const anyPrint = printfMatch || pythonPrintMatch || coutMatch || consoleLogMatch || sysOutMatch;

        if (anyPrint) {
            let content = '';

            if (printfMatch) {
                const formatStr = printfMatch[1];
                const argsStr = printfMatch[2] || '';
                const args = argsStr.split(',').map(a => a.trim()).filter(a => a);
                let interpolated = formatStr;
                let argIdx = 0;
                interpolated = interpolated.replace(/%[difs]/g, () => {
                    if (argIdx < args.length) {
                        const argName = args[argIdx++];
                        const val = currentVariables[argName];
                        return val !== undefined ? String(val) : argName;
                    }
                    return '?';
                });
                interpolated = interpolated.replace(/\\n/g, '').replace(/\\t/g, '\t');
                content = interpolated;
            } else if (pythonPrintMatch) {
                content = pythonPrintMatch[1] || '';
                if (!content && pythonPrintMatch[2]) {
                    // print(variable) or print(expression)
                    const expr = pythonPrintMatch[2].trim();
                    const val = currentVariables[expr];
                    content = val !== undefined ? String(val) : expr;
                }
            } else if (coutMatch) {
                if (coutMatch[1]) {
                    content = coutMatch[1];
                } else if (coutMatch[2]) {
                    const val = currentVariables[coutMatch[2]];
                    content = val !== undefined ? String(val) : coutMatch[2];
                }
            } else if (consoleLogMatch) {
                content = consoleLogMatch[1] || consoleLogMatch[2] || '';
            } else if (sysOutMatch) {
                content = sysOutMatch[1] || sysOutMatch[2] || '';
            }

            content = content.replace(/\\n/g, '').replace(/\\t/g, '\t');

            steps.push(makeStep({
                lineIndex,
                explanation: `Outputting to console: "${content}"`,
                terminalOutput: content
            }));
            continue;
        }

        // ==========================================
        // 4. ARRAY CREATION
        // ==========================================
        // C: int arr[5]; or int arr[] = {1,2,3};
        // Python: arr = [1,2,3]
        // Java: int[] arr = {1,2,3};
        const cArrayDecl = line.match(/(?:int|float|double|char)\s+([\w_]+)\s*\[\s*(\d*)\s*\]\s*(?:=\s*\{(.*)\})?/);
        const pyArrayDecl = line.match(/([\w_]+)\s*=\s*\[(.*)\]/);
        const javaArrayDecl = line.match(/(?:int|float|double)\[\]\s+([\w_]+)\s*=\s*(?:new\s+\w+\[\d+\]|\{(.*)\})/);

        if (cArrayDecl || pyArrayDecl || javaArrayDecl) {
            const match = cArrayDecl || pyArrayDecl || javaArrayDecl;
            const arrayName = match![1];
            const valuesStr = cArrayDecl ? (cArrayDecl[3] || '') : (pyArrayDecl ? pyArrayDecl[2] : (javaArrayDecl ? (javaArrayDecl[2] || '') : ''));
            const size = cArrayDecl && cArrayDecl[2] ? parseInt(cArrayDecl[2]) : 0;

            let values: number[];
            if (valuesStr) {
                values = valuesStr.split(',').map(v => {
                    const n = Number(v.trim());
                    return isNaN(n) ? 0 : n;
                });
            } else if (size > 0) {
                values = new Array(size).fill(0);
            } else {
                values = [];
            }

            // Remove old array with same name if exists
            currentArrays = currentArrays.filter(a => a.id !== arrayName);
            currentArrays.push({ id: arrayName, values: [...values], highlights: [], swapping: [] });

            steps.push(makeStep({
                lineIndex,
                explanation: `Creating array '${arrayName}' with ${values.length} elements: [${values.join(', ')}]`,
                action: 'array_create',
                actionData: { name: arrayName, size: values.length, values }
            }));
            continue;
        }

        // ==========================================
        // 5. ARRAY SWAP (Python style: a[i], a[j] = a[j], a[i])
        // ==========================================
        const swapMatch = line.match(/([\w_]+)\[(.*?)\]\s*,\s*([\w_]+)\[(.*?)\]\s*=\s*([\w_]+)\[(.*?)\]\s*,\s*([\w_]+)\[(.*?)\]/);
        if (swapMatch) {
            const arrName = swapMatch[1];
            const idx1 = isNaN(Number(swapMatch[2])) ? (currentVariables[swapMatch[2]] || 0) : Number(swapMatch[2]);
            const idx2 = isNaN(Number(swapMatch[4])) ? (currentVariables[swapMatch[4]] || 0) : Number(swapMatch[4]);

            const arr = currentArrays.find(a => a.id === arrName);
            if (arr && idx1 < arr.values.length && idx2 < arr.values.length) {
                const temp = arr.values[idx1];
                arr.values[idx1] = arr.values[idx2];
                arr.values[idx2] = temp;

                steps.push(makeStep({
                    lineIndex,
                    explanation: `Swapping ${arrName}[${idx1}] and ${arrName}[${idx2}].`,
                    action: 'array_swap',
                    actionData: { name: arrName, index: idx1, swapWith: idx2 }
                }));
            }
            continue;
        }

        // ==========================================
        // 6. ARRAY ACCESS / UPDATE (arr[i] = val)
        // ==========================================
        const arrayAccessMatch = line.match(/([\w_]+)\[(\d+|[\w_]+)\]\s*=\s*([^;]+)/);
        if (arrayAccessMatch) {
            const arrName = arrayAccessMatch[1];
            const index = isNaN(Number(arrayAccessMatch[2])) ? (currentVariables[arrayAccessMatch[2]] || 0) : Number(arrayAccessMatch[2]);
            const value = resolveValue(arrayAccessMatch[3]);

            const arr = currentArrays.find(a => a.id === arrName);
            if (arr) {
                if (index < arr.values.length) arr.values[index] = value;
                steps.push(makeStep({
                    lineIndex,
                    explanation: `Setting ${arrName}[${index}] = ${value}.`,
                    action: 'array_insert',
                    actionData: { name: arrName, index, value }
                }));
            }
            continue;
        }

        // ==========================================
        // 7. FOR LOOPS (unrolled)
        // ==========================================
        if (line.match(/^for\s*[\(:]/) || line.match(/^for\s+\w+\s+in\s+/)) {
            const rangeMatch = line.match(/range\((\d+)(?:,\s*(\d+))?\)/);
            const cStyleMatch = line.match(/;\s*\w+\s*<\s*(\d+|[\w_]+)/);

            let limit = 3; // default
            if (rangeMatch) {
                limit = rangeMatch[2] ? parseInt(rangeMatch[2]) : parseInt(rangeMatch[1]);
            } else if (cStyleMatch) {
                const val = cStyleMatch[1];
                limit = isNaN(Number(val)) ? (currentVariables[val] || 3) : Number(val);
            }

            // Cap to prevent excessive steps
            if (limit > 20) limit = 20;

            // Extract loop variable name
            const loopVarMatch = line.match(/(?:int|let|var)?\s*([\w_]+)\s*[=:]/);
            const pyLoopVarMatch = line.match(/for\s+([\w_]+)\s+in/);
            const loopVar = (loopVarMatch ? loopVarMatch[1] : (pyLoopVarMatch ? pyLoopVarMatch[1] : 'i'));

            for (let k = 0; k < limit; k++) {
                currentVariables[loopVar] = k;

                steps.push(makeStep({
                    lineIndex,
                    explanation: `Loop iteration ${k + 1} of ${limit}. ${loopVar} = ${k}`,
                    action: 'loop_iteration'
                }));
            }
            continue;
        }

        // ==========================================
        // 8. WHILE LOOPS
        // ==========================================
        if (line.match(/^while\s*[\(:]/) || line.match(/^do\s*\{?$/)) {
            steps.push(makeStep({
                lineIndex,
                explanation: `While loop — checking condition...`,
                action: 'loop_iteration'
            }));
            continue;
        }

        // ==========================================
        // 9. IF/ELSE (just note the branch)
        // ==========================================
        if (line.match(/^(?:if|else\s*if|elif|else)\s*[\(:{]?/)) {
            steps.push(makeStep({
                lineIndex,
                explanation: `Evaluating condition: ${line.replace(/[{:]/g, '').trim()}`
            }));
            continue;
        }

        // ==========================================
        // 10. RETURN STATEMENTS
        // ==========================================
        if (line.match(/^return\b/)) {
            const retVal = line.replace(/^return\s*/, '').replace(/;$/, '').trim();
            const resolved = retVal ? resolveValue(retVal) : 'void';

            steps.push(makeStep({
                lineIndex,
                explanation: `Returning ${resolved} from function.`,
                action: 'function_return',
                terminalOutput: resolved !== 'void' && resolved !== '' ? `Program returned: ${resolved}` : undefined
            }));
            if (callStack.length > 0) callStack.pop();
            continue;
        }

        // ==========================================
        // 11. VARIABLE DECLARATIONS / ASSIGNMENTS (broadened)
        // ==========================================
        // Skip known structural keywords
        const skipWords = ['return', 'else', 'do', 'break', 'continue', 'while', 'for', 'if', 'switch', 'case', 'class', 'struct', 'enum', 'try', 'catch', 'finally', 'throw', 'throws'];
        const firstWord = line.split(/[\s(={]/)[0].replace(/;/g, '');
        if (skipWords.includes(firstWord)) continue;

        // Match: int x = 5; | x = 10; | let x = 5; | const x = "hi"; | float x; | n = int(input())
        const varDeclMatch = line.match(/^(?:int|float|double|char|long|short|unsigned|string|bool|boolean|let|const|var)?\s*([\w_]+)\s*=\s*([^;]+)/);
        const varOnlyMatch = !varDeclMatch ? line.match(/^(?:int|float|double|char|long|short|unsigned|string|bool|boolean)\s+([\w_]+)\s*;/) : null;

        if (varDeclMatch) {
            const varName = varDeclMatch[1];
            const val = resolveValue(varDeclMatch[2]);
            const isNew = !currentVariables.hasOwnProperty(varName);
            currentVariables[varName] = val;

            steps.push(makeStep({
                lineIndex,
                explanation: isNew
                    ? `📦 Created variable '${varName}' = ${val}`
                    : `✏️ Updated variable '${varName}' → ${val}`,
                action: isNew ? 'create_variable' : 'update_variable',
                actionData: { name: varName, value: val }
            }));
            continue;
        }

        if (varOnlyMatch) {
            const varName = varOnlyMatch[1];
            currentVariables[varName] = 'undefined';

            steps.push(makeStep({
                lineIndex,
                explanation: `📦 Declared variable '${varName}' (uninitialized)`,
                action: 'create_variable',
                actionData: { name: varName, value: 'undefined' }
            }));
            continue;
        }

        // ==========================================
        // 12. FUNCTION CALLS (standalone, e.g. foo(x))
        // ==========================================
        const funcCallMatch = line.match(/^([\w_]+)\s*\((.*)?\)\s*;?$/);
        if (funcCallMatch) {
            const funcName = funcCallMatch[1];
            // Skip known non-function keywords that look like calls
            if (!['if', 'while', 'for', 'switch', 'return'].includes(funcName)) {
                steps.push(makeStep({
                    lineIndex,
                    explanation: `Calling function ${funcName}()`
                }));
                continue;
            }
        }

        // ==========================================
        // 13. FALLBACK — catch any remaining line
        // ==========================================
        steps.push(makeStep({
            lineIndex,
            explanation: `Executing: ${line.length > 60 ? line.substring(0, 57) + '...' : line}`
        }));
    }

    // Final "done" step
    steps.push(makeStep({
        lineIndex: lines.length,
        explanation: `✅ Program finished successfully.`,
        terminalOutput: '\nProgram finished successfully.'
    }));

    return steps;
}
