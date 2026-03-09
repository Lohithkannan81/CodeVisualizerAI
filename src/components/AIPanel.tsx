import { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Sparkles, User, Send } from 'lucide-react';
import { useExecutionStore } from '../store/useExecutionStore';

export function AIPanel() {
    const steps = useExecutionStore((state) => state.steps);
    const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
    const currentStep = steps[currentStepIndex];

    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentStepIndex]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: input }]);
        const query = input;
        setInput('');
        setIsTyping(true);

        // Mock AI Response based on context
        setTimeout(() => {
            let response = "That's a great question! I'm an AI tutor simulation.";
            if (query.toLowerCase().includes('output')) {
                response = "The output of this algorithm will be the fully sorted array: [1, 2, 4, 7].";
            } else if (query.toLowerCase().includes('real-life') || query.toLowerCase().includes('real life')) {
                response = "Think of this like arranging books on a shelf by height. You compare two adjacent books, and if the left one is taller, you swap them!";
            } else if (query.toLowerCase().includes('simplify') || query.toLowerCase().includes('explain')) {
                response = "Currently, we are at line " + currentStep.lineIndex + ". " + currentStep.explanation;
            } else if (query.toLowerCase().includes('loop')) {
                response = "This loop runs so we can guarantee every element has been checked against its neighbor. Because it takes 'n' passes to ensure the array is sorted, we use a nested loop structure.";
            }

            setMessages(prev => [...prev, { role: 'ai', content: response }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="absolute bottom-6 right-6 w-80 lg:w-96 glass-panel rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[450px] z-30 pointer-events-auto">
            <div className="h-10 bg-black/40 border-b border-gray-800 flex items-center px-4 gap-2 shrink-0">
                <BrainCircuit className="w-4 h-4 text-neon-purple" />
                <span className="text-xs font-mono uppercase tracking-wider text-white/90">AI Tutor</span>
                <div className="ml-auto flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                    <span className="text-[10px] uppercase text-neon-green font-mono tracking-wider items-center flex">Online</span>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar scroll-smooth">
                {/* Intro Message */}
                {currentStepIndex === 0 && (
                    <div className="bg-black/40 rounded-lg p-3 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-neon-purple" />
                            <span className="text-xs font-semibold text-neon-purple">System</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Welcome to the <strong className="text-white">Code Execution Universe</strong>!
                            Press play to watch the code execute in 3D, and I'll explain each step.
                        </p>
                    </div>
                )}

                {/* Dynamic Context Explanation */}
                {currentStep && (
                    <div className="bg-black/40 rounded-lg p-3 border border-neon-blue/30 shadow-[0_0_15px_rgba(0,243,255,0.05)] space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 mb-1">
                            <BrainCircuit className="w-3 h-3 text-neon-blue" />
                            <span className="text-xs font-semibold text-neon-blue font-mono">Step {currentStepIndex + 1}</span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed font-sans">
                            {currentStep.explanation}
                        </p>
                    </div>
                )}

                {/* User / AI Chat Messages */}
                {messages.map((msg, i) => (
                    <div key={i} className={"flex flex-col space-y-1 " + (msg.role === 'user' ? 'items-end' : 'items-start')}>
                        <div className={"flex items-center gap-2 mb-1 " + (msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                            {msg.role === 'user' ? <User className="w-3 h-3 text-gray-400" /> : <BrainCircuit className="w-3 h-3 text-neon-purple" />}
                            <span className={"text-[10px] font-semibold uppercase " + (msg.role === 'user' ? 'text-gray-400' : 'text-neon-purple')}>
                                {msg.role === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                        </div>
                        <div className={"p-3 rounded-lg max-w-[90%] text-sm leading-relaxed " + (msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-neon-purple/20 text-white border border-neon-purple/30 rounded-tl-sm')}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex items-center gap-2 text-neon-purple text-xs font-mono animate-pulse">
                        <BrainCircuit className="w-3 h-3" />
                        Generating response...
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/30 shrink-0 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-all placeholder:text-gray-600 font-sans"
                />
                <button type="submit" disabled={!input} className="p-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
