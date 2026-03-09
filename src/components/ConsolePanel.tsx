import { Terminal, AlertTriangle } from 'lucide-react';
import { useExecutionStore } from '../store/useExecutionStore';
import { useEffect, useRef } from 'react';

export function ConsolePanel() {
    const output = useExecutionStore((state) => state.output);
    const error = useExecutionStore((state) => state.error);
    const isCompiling = useExecutionStore((state) => state.isCompiling);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output, error]);

    return (
        <div className="h-48 bg-black/60 border-t border-white/10 flex flex-col shrink-0 relative overflow-hidden">
            <div className="h-8 border-b border-white/5 flex items-center px-4 justify-between bg-black/40 shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-neon-blue" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Standard Output</span>
                    {isCompiling && (
                        <div className="flex gap-1 ml-2">
                            <div className="w-1 h-1 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-1 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
            >
                {error && (
                    <div className="flex gap-2 text-red-400 mb-2 p-2 bg-red-400/5 border border-red-400/20 rounded">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="whitespace-pre-wrap">{error}</span>
                    </div>
                )}
                <div className="text-neon-green/90 whitespace-pre-wrap">
                    {output || (isCompiling ? '> System busy...' : '> System ready. Waiting for execution...')}
                </div>
                {!isCompiling && <span className="inline-block w-1.5 h-3.5 ml-1 bg-neon-green/50 animate-pulse align-middle" />}
            </div>
        </div>
    );
}
