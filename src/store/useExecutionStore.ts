import { create } from 'zustand';
import { examples, type ExecutionStep } from '../examples';
import { generateAITrace } from '../services/AITracingService';

interface ExecutionState {
    code: string;
    setCode: (code: string) => void;

    language: string;
    setLanguage: (lang: string) => void;

    steps: ExecutionStep[];
    currentStepIndex: number;

    output: string;
    isCompiling: boolean;
    isWaitingForInput: boolean;
    inputBuffer: string;
    setInputBuffer: (input: string) => void;
    provideInput: (value: string) => void;

    isPlaying: boolean;
    playSpeed: number; // 0.5x, 1x, 2x
    algorithmMode: boolean;
    toggleAlgorithmMode: () => void;

    // Actions
    loadExample: (id: string) => void;
    runCode: () => Promise<void>;
    play: () => void;
    pause: () => void;
    stepForward: () => void;
    stepBack: () => void;
    setStep: (index: number) => void;
    reset: () => void;
    setSpeed: (speed: number) => void;

    // Internal for loop
    tick: () => void;
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
    code: examples['bubble_sort'].code,
    language: 'python',
    steps: examples['bubble_sort'].steps,
    currentStepIndex: 0,
    output: '',
    isCompiling: false,
    isWaitingForInput: false,
    inputBuffer: '',
    setInputBuffer: (inputBuffer) => set({ inputBuffer }),

    isPlaying: false,
    playSpeed: 1,
    algorithmMode: false,

    toggleAlgorithmMode: () => set(state => ({ algorithmMode: !state.algorithmMode })),

    setCode: (code) => set({ code }),
    setLanguage: (language) => set({ language }),

    loadExample: (id) => {
        const example = examples[id];
        if (example) {
            set({
                code: example.code,
                language: example.language || 'python',
                steps: example.steps,
                currentStepIndex: 0,
                isPlaying: false,
                output: '',
                isWaitingForInput: false,
            });
        }
    },

    runCode: async () => {
        const { code, language } = get();
        if (!code.trim()) return;

        set({ isCompiling: true, output: '', currentStepIndex: 0, isPlaying: false, isWaitingForInput: false });

        try {
            // Check if code matches a pre-built example
            let isExample = false;
            let exampleSteps: any = null;

            for (const key in examples) {
                if (examples[key].code.trim() === code.trim()) {
                    isExample = true;
                    exampleSteps = examples[key].steps;
                    break;
                }
            }

            let finalSteps: ExecutionStep[];

            if (isExample) {
                finalSteps = exampleSteps;
            } else {
                // Generate AI trace for user code
                finalSteps = await generateAITrace(code, language);
            }

            if (!finalSteps || finalSteps.length === 0) {
                set({
                    output: '(No execution steps generated. Try a different example or code.)',
                    isCompiling: false
                });
                return;
            }

            set({
                steps: finalSteps,
                output: '', // Output appears step-by-step as animation plays
                isCompiling: false,
                isPlaying: !finalSteps[0]?.inputRequired, // Don't auto-play if first step needs input
                isWaitingForInput: !!finalSteps[0]?.inputRequired,
                currentStepIndex: 0
            });

        } catch (error: any) {
            set({
                output: `[Error] Failed to analyze code:\n${error.message}`,
                isCompiling: false
            });
        }
    },

    provideInput: (value) => {
        const { output } = get();

        // Show the input in the console like a real terminal
        set({
            output: output + '\n> ' + value,
            isWaitingForInput: false,
            inputBuffer: ''
        });

        // Resume playback if it was playing
        // We actually want to move to the next step immediately after input is provided
        get().stepForward();
    },

    play: () => {
        const { currentStepIndex, steps, isWaitingForInput } = get();
        if (isWaitingForInput) return; // Cannot play while waiting for input

        if (currentStepIndex >= steps.length - 1 && steps.length > 0) {
            set({ currentStepIndex: 0, isPlaying: true });
        } else {
            set({ isPlaying: true });
        }
    },
    pause: () => set({ isPlaying: false }),

    stepForward: () => {
        const { currentStepIndex, steps, isWaitingForInput } = get();
        if (isWaitingForInput) return;

        if (currentStepIndex < steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            const nextStep = steps[nextIndex];
            const nextOutput = get().output + (nextStep.terminalOutput ? (get().output ? '\n' : '') + nextStep.terminalOutput : '');

            if (nextStep?.inputRequired) {
                set({
                    currentStepIndex: nextIndex,
                    isPlaying: false,
                    isWaitingForInput: true,
                    output: nextOutput
                });
            } else {
                set({
                    currentStepIndex: nextIndex,
                    output: nextOutput
                });
            }
        } else {
            set({ isPlaying: false });
        }
    },

    stepBack: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
            set({ currentStepIndex: currentStepIndex - 1, isPlaying: false, isWaitingForInput: false });
        }
    },

    setStep: (index: number) => {
        const { steps } = get();
        if (index >= 0 && index < steps.length) {
            // Recompute output from start to this index
            let newOutput = '';
            for (let i = 0; i <= index; i++) {
                if (steps[i].terminalOutput) {
                    newOutput += (newOutput ? '\n' : '') + steps[i].terminalOutput;
                }
            }

            const step = steps[index];
            set({
                currentStepIndex: index,
                isPlaying: false,
                isWaitingForInput: !!step.inputRequired,
                output: newOutput
            });
        }
    },

    reset: () => set({ currentStepIndex: 0, isPlaying: false, isWaitingForInput: false }),

    setSpeed: (speed) => set({ playSpeed: speed }),

    tick: () => {
        const { isPlaying, currentStepIndex, steps, isWaitingForInput } = get();
        if (!isPlaying || isWaitingForInput) return;

        if (currentStepIndex < steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            const nextStep = steps[nextIndex];
            const nextOutput = get().output + (nextStep.terminalOutput ? (get().output ? '\n' : '') + nextStep.terminalOutput : '');

            if (nextStep?.inputRequired) {
                set({
                    currentStepIndex: nextIndex,
                    isPlaying: false,
                    isWaitingForInput: true,
                    output: nextOutput
                });
            } else {
                set({
                    currentStepIndex: nextIndex,
                    output: nextOutput
                });
            }
        } else {
            set({ isPlaying: false });
        }
    }
}));
