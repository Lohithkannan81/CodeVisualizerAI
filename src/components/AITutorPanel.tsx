import { useExecutionStore } from '../store/useExecutionStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle, Lightbulb, Brain } from 'lucide-react';

const ACTION_TIPS: Record<string, string> = {
    create_variable: 'Imagine labeling a box to store something for later.',
    update_variable: 'Think of it as updating the label on an existing box.',
    create_array: 'An array is a row of numbered boxes — one index per position.',
    update_array: 'One element in the row of boxes is being updated now.',
    swap: 'Two boxes are exchanging their contents — a classic sort trick.',
    loop_iteration: 'Think of repeating a chore until it\'s done.',
    function_call: 'A new task starts — push it onto the calling stack.',
    function_return: 'The task is done — control returns to the caller.',
    stack_push: 'Something is added to the top of the stack — like a stack of plates.',
    stack_pop: 'The topmost item is removed — LIFO (Last In, First Out).',
    input: 'The program is waiting for you to type something.',
    output: 'The program is printing a result to the console.',
};

export function AITutorPanel() {
    const aiExplanation = useExecutionStore((state) => state.aiExplanation);
    const stepExplanation = useExecutionStore((state) => state.stepExplanation);
    const steps = useExecutionStore((state) => state.executionSteps);
    const currentStep = useExecutionStore((state) => state.currentStep);
    const isCompiling = useExecutionStore((state) => state.isCompiling);

    const step = steps[currentStep];
    const tip = step ? ACTION_TIPS[step.action] ?? 'Watch the visualization to see how data flows.' : null;

    return (
        <div className="flex flex-col h-full bg-black/40 border-l border-white/10 w-80 shrink-0">
            {/* Header */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 bg-black/40">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-purple animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">AI Tutor</span>
                </div>
                {step && (
                    <span className="ml-auto text-[9px] font-mono text-neon-blue/60 border border-neon-blue/20 px-1.5 py-0.5 rounded">
                        STEP {currentStep + 1}/{steps.length}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {isCompiling ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-4">
                        <div className="relative">
                            <div className="w-10 h-10 border-2 border-neon-purple rounded-full animate-spin border-t-transparent" />
                            <Brain className="w-4 h-4 text-neon-purple absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <span className="text-xs font-mono text-neon-purple animate-pulse">
                            AI is thinking…
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Overall explanation */}
                        <section className="space-y-2">
                            <div className="flex items-center gap-2 text-neon-purple">
                                <Lightbulb className="w-3.5 h-3.5" />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest">Program Overview</h3>
                            </div>
                            <div className="glass-panel p-3 border border-neon-purple/20 bg-neon-purple/5 rounded-lg">
                                <p className="text-xs text-gray-300 leading-relaxed italic">
                                    {aiExplanation || 'Write or select some code and click Run to see AI analysis.'}
                                </p>
                            </div>
                        </section>

                        {/* Per-step breakdown */}
                        <AnimatePresence mode="wait">
                            {step && (
                                <motion.section
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center gap-2 text-neon-blue">
                                        <HelpCircle className="w-3.5 h-3.5" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Current Step</h3>
                                    </div>

                                    {/* Action badge + line number */}
                                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                                        <span>LINE {step.line}</span>
                                        <span className="text-neon-blue/80 px-1.5 py-0.5 border border-neon-blue/30 rounded bg-neon-blue/5 capitalize">
                                            {step.action.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    {/* Step explanation */}
                                    <div className="p-3 bg-neon-blue/5 border border-neon-blue/20 rounded-lg">
                                        <p className="text-xs text-neon-blue/90 font-medium leading-relaxed">
                                            {stepExplanation || `Executing line ${step.line}: ${step.action.replace(/_/g, ' ')}.`}
                                        </p>
                                    </div>

                                    {/* Variable / value pill */}
                                    {step.variable && (
                                        <div className="text-[10px] space-y-1">
                                            <div className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/10">
                                                <span className="text-gray-400 font-mono">
                                                    <span className="text-neon-purple">var</span> {step.variable}
                                                </span>
                                                <span className="text-neon-green font-mono font-bold">
                                                    = {JSON.stringify(step.value)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Array info */}
                                    {step.array && step.index !== undefined && (
                                        <div className="text-[10px] flex justify-between items-center bg-white/5 p-2 rounded border border-white/10">
                                            <span className="text-gray-400 font-mono">
                                                <span className="text-neon-purple">arr</span> {step.array}[{step.index}]
                                            </span>
                                            <span className="text-neon-green font-mono">= {JSON.stringify(step.value)}</span>
                                        </div>
                                    )}
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>

            {/* Footer tip */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="text-[9px] text-gray-500 uppercase tracking-tighter mb-1.5 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    Mental Model
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">
                    {tip ?? 'Watch the center visualization to see how data flows.'}
                </p>
            </div>
        </div>
    );
}
