import { create } from 'zustand';
import { examples } from '../examples';
import { apiService, type AnimationStep } from '../services/apiService';

// ─── State Shape ───────────────────────────────────────────────────────────────

interface ExecutionState {
    // Editor state
    code: string;
    language: string;
    setCode: (code: string) => void;
    setLanguage: (lang: string) => void;

    // Execution result
    consoleOutput: string;
    error: string | null;

    // Animation queue — structured steps returned by /api/analyze or /api/animate
    executionSteps: AnimationStep[];
    animationQueue: AnimationStep[];
    currentStep: number;

    // AI explanation
    /** Overall explanation for the whole program */
    aiExplanation: string;
    /** Per-step explanation synced to currentStep */
    stepExplanation: string;

    // Status flags
    isCompiling: boolean;
    isPlaying: boolean;
    playSpeed: number;
    isWaitingForInput: boolean;
    inputBuffer: string;
    algorithmMode: boolean;

    // Input actions
    setInputBuffer: (input: string) => void;
    provideInput: (value: string) => void;

    // Main actions
    loadExample: (id: string) => void;
    /** Calls /api/run → /api/analyze → fills store → triggers animation */
    runCode: () => Promise<void>;
    /** Only sends code to /api/analyze without running it */
    analyzeCode: () => Promise<void>;
    /** Starts playback from current position */
    startAnimation: () => void;
    play: () => void;
    pause: () => void;
    /** Advance one step */
    nextStep: () => void;
    /** Go back one step */
    previousStep: () => void;
    stepForward: () => void;
    stepBack: () => void;
    setStep: (index: number) => void;
    reset: () => void;
    setSpeed: (speed: number) => void;
    toggleAlgorithmMode: () => void;

    // Internal tick used by the playback loop
    tick: () => void;

    // ── Legacy aliases (kept for existing components) ──
    /** @alias consoleOutput */
    output: string;
    /** @alias executionSteps */
    steps: AnimationStep[];
    /** @alias currentStep */
    currentStepIndex: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function stepExplanationFor(steps: AnimationStep[], index: number): string {
    const step = steps[index];
    if (!step) return '';
    if (step.explanation) return step.explanation;
    if (step.message) return step.message;
    const action = step.action.replace(/_/g, ' ');
    return `Line ${step.line}: ${action}${step.variable ? ` — ${step.variable}` : ''}.`;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useExecutionStore = create<ExecutionState>((set, get) => ({
    // ── Initial state ──────────────────────────────────────────────────────────

    code: examples['bubble_sort'].code,
    language: 'python',
    executionSteps: [],
    animationQueue: [],
    currentStep: 0,
    consoleOutput: '',
    isCompiling: false,
    isWaitingForInput: false,
    inputBuffer: '',
    aiExplanation: '',
    stepExplanation: '',
    error: null,
    isPlaying: false,
    playSpeed: 1,
    algorithmMode: false,

    // ── Legacy aliases (derived getters via proxy-like pattern) ───────────────
    get output() { return get().consoleOutput; },
    get steps() { return get().executionSteps; },
    get currentStepIndex() { return get().currentStep; },

    // ── Simple setters ─────────────────────────────────────────────────────────

    setCode: (code) => set({ code }),
    setLanguage: (language) => set({ language }),
    setInputBuffer: (inputBuffer) => set({ inputBuffer }),
    toggleAlgorithmMode: () => set((s) => ({ algorithmMode: !s.algorithmMode })),
    setSpeed: (playSpeed) => set({ playSpeed }),

    // ── Load example ───────────────────────────────────────────────────────────

    loadExample: (id) => {
        const example = examples[id];
        if (example) {
            // Bridge ExecutionStep (lineIndex, explanation) → AnimationStep (line, message)
            const steps: AnimationStep[] = example.steps.map((s) => ({
                line: (s as any).lineIndex ?? (s as any).line ?? 1,
                action: (s as any).action ?? 'update_variable',
                variable: (s as any).variable,
                value: (s as any).value,
                message: (s as any).explanation ?? (s as any).message,
                explanation: (s as any).explanation ?? (s as any).message,
                array: (s as any).array,
                index: (s as any).index,
                swapWith: (s as any).swapWith,
                functionName: (s as any).functionName,
            }));
            set({
                code: example.code,
                language: example.language || 'python',
                executionSteps: steps,
                animationQueue: steps,
                currentStep: 0,
                isPlaying: false,
                consoleOutput: '',
                isWaitingForInput: false,
                aiExplanation: 'Example loaded. Press Run to analyse.',
                stepExplanation: stepExplanationFor(steps, 0),
                error: null,
            });
        }
    },

    // ── runCode: /api/run → /api/analyze → store → animate ───────────────────

    runCode: async () => {
        const { code, language } = get();
        if (!code.trim()) return;

        set({
            isCompiling: true,
            consoleOutput: '',
            currentStep: 0,
            isPlaying: false,
            isWaitingForInput: false,
            error: null,
            executionSteps: [],
            animationQueue: [],
            aiExplanation: '🤖 AI is analysing your code…',
            stepExplanation: '',
        });

        try {
            // Step 1 – Run code to get program output
            const [runResult, analysisResult] = await Promise.allSettled([
                apiService.runCode(code, language),
                apiService.analyzeCode(code, language),
            ]);

            // Process run result
            let consoleOutput = '';
            let error: string | null = null;

            if (runResult.status === 'fulfilled') {
                const r = runResult.value;
                consoleOutput = r.stdout || '';
                if (r.stderr) {
                    error = r.stderr;
                    if (!consoleOutput) consoleOutput = r.stderr;
                }
            } else {
                error = runResult.reason?.message ?? 'Code execution failed.';
            }

            // Process analysis result
            let steps: AnimationStep[] = [];
            let aiExplanation = 'AI analysis unavailable.';

            if (analysisResult.status === 'fulfilled') {
                const a = analysisResult.value;
                steps = a.steps ?? [];
                aiExplanation = a.explanation ?? aiExplanation;
            } else {
                aiExplanation = `AI Error: ${analysisResult.reason?.message ?? 'Unknown error.'}`;
            }

            const firstStepWaitsForInput = steps[0]?.action === 'input';

            set({
                consoleOutput,
                error,
                executionSteps: steps,
                animationQueue: steps,
                aiExplanation,
                stepExplanation: stepExplanationFor(steps, 0),
                isCompiling: false,
                currentStep: 0,
                isWaitingForInput: firstStepWaitsForInput,
                isPlaying: steps.length > 0 && !firstStepWaitsForInput,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            set({
                error: `Execution failed: ${message}`,
                isCompiling: false,
                aiExplanation: '⚠️ Something went wrong during execution.',
            });
        }
    },

    // ── analyzeCode: only /api/analyze, no run ────────────────────────────────

    analyzeCode: async () => {
        const { code, language } = get();
        if (!code.trim()) return;

        set({
            isCompiling: true,
            aiExplanation: '🤖 Analysing code…',
            stepExplanation: '',
            error: null,
        });

        try {
            const result = await apiService.analyzeCode(code, language);
            const steps = result.steps ?? [];
            set({
                executionSteps: steps,
                animationQueue: steps,
                aiExplanation: result.explanation ?? '',
                stepExplanation: stepExplanationFor(steps, 0),
                currentStep: 0,
                isCompiling: false,
                isPlaying: false,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            set({
                error: `Analysis failed: ${message}`,
                isCompiling: false,
                aiExplanation: '⚠️ AI analysis failed. Check backend connection.',
            });
        }
    },

    // ── Animation controls ─────────────────────────────────────────────────────

    startAnimation: () => {
        const { currentStep, executionSteps, isWaitingForInput } = get();
        if (isWaitingForInput || executionSteps.length === 0) return;
        // Restart from beginning if at end
        if (currentStep >= executionSteps.length - 1) {
            set({ currentStep: 0, isPlaying: true });
        } else {
            set({ isPlaying: true });
        }
    },

    play: () => {
        const { currentStep, executionSteps, isWaitingForInput } = get();
        if (isWaitingForInput) return;
        if (currentStep >= executionSteps.length - 1 && executionSteps.length > 0) {
            set({ currentStep: 0, isPlaying: true });
        } else {
            set({ isPlaying: true });
        }
    },

    pause: () => set({ isPlaying: false }),

    nextStep: () => {
        const { currentStep, executionSteps, isWaitingForInput } = get();
        if (isWaitingForInput) return;
        if (currentStep < executionSteps.length - 1) {
            const next = currentStep + 1;
            const nextStepData = executionSteps[next];
            const waitingForInput = nextStepData?.action === 'input';
            set({
                currentStep: next,
                stepExplanation: stepExplanationFor(executionSteps, next),
                isWaitingForInput: waitingForInput,
                isPlaying: !waitingForInput && get().isPlaying,
            });
        } else {
            set({ isPlaying: false });
        }
    },

    previousStep: () => {
        const { currentStep, executionSteps } = get();
        if (currentStep > 0) {
            const prev = currentStep - 1;
            set({
                currentStep: prev,
                stepExplanation: stepExplanationFor(executionSteps, prev),
                isPlaying: false,
                isWaitingForInput: false,
            });
        }
    },

    // ── Legacy aliases for existing components ─────────────────────────────────
    stepForward: () => get().nextStep(),
    stepBack: () => get().previousStep(),

    setStep: (index) => {
        const { executionSteps } = get();
        if (index >= 0 && index < executionSteps.length) {
            set({
                currentStep: index,
                stepExplanation: stepExplanationFor(executionSteps, index),
                isPlaying: false,
                isWaitingForInput: executionSteps[index]?.action === 'input',
            });
        }
    },

    reset: () =>
        set({
            currentStep: 0,
            isPlaying: false,
            isWaitingForInput: false,
            stepExplanation: stepExplanationFor(get().executionSteps, 0),
        }),

    // ── Input handling ─────────────────────────────────────────────────────────

    provideInput: (value) => {
        const { consoleOutput } = get();
        set({
            consoleOutput: `${consoleOutput}\n> ${value}`,
            isWaitingForInput: false,
            inputBuffer: '',
        });
        get().nextStep();
    },

    // ── Internal playback tick (called by animation loop) ─────────────────────

    tick: () => {
        const { isPlaying, isWaitingForInput } = get();
        if (!isPlaying || isWaitingForInput) return;
        get().nextStep();
    },
}));
