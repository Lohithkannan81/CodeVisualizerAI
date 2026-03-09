import { useRef, useEffect } from 'react';
import { Keyboard, CornerDownLeft } from 'lucide-react';
import { useExecutionStore } from '../store/useExecutionStore';

export function InputPanel() {
    const isWaitingForInput = useExecutionStore((state) => state.isWaitingForInput);
    const inputBuffer = useExecutionStore((state) => state.inputBuffer);
    const setInputBuffer = useExecutionStore((state) => state.setInputBuffer);
    const provideInput = useExecutionStore((state) => state.provideInput);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isWaitingForInput) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isWaitingForInput]);

    if (!isWaitingForInput) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputBuffer.trim()) {
            provideInput(inputBuffer.trim());
        }
    };

    return (
        <div className="mx-4 mb-2 animate-in slide-in-from-bottom-2 duration-300">
            <div className="glass-panel border border-neon-blue/30 bg-neon-blue/5 rounded-lg p-3 shadow-[0_0_20px_rgba(0,243,255,0.1)]">
                <div className="flex items-center gap-2 mb-2">
                    <Keyboard className="w-3.5 h-3.5 text-neon-blue" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neon-blue">User Input Required</span>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputBuffer}
                        onChange={(e) => setInputBuffer(e.target.value)}
                        placeholder="Type value and press Enter..."
                        className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-1.5 text-sm font-mono focus:border-neon-blue/50 outline-none transition-colors"
                    />
                    <button
                        type="submit"
                        className="px-3 py-1.5 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/30 rounded flex items-center gap-2 transition-all hover:scale-105"
                    >
                        <span className="text-xs font-bold uppercase">Send</span>
                        <CornerDownLeft className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
