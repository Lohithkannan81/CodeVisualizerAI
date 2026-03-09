import { Activity, Cpu } from 'lucide-react';
import { examples } from '../examples';

interface ComplexityAnalyzerProps {
    onClose: () => void;
}

export function ComplexityAnalyzer({ onClose }: ComplexityAnalyzerProps) {
    // Since we only have one example loaded statically in the mock, we can hardcode for now
    // or grab from the store if we had multiple. We'll grab from the bubble_sort example directly.
    const example = examples['bubble_sort'];

    return (
        <div className="absolute top-16 right-6 w-80 glass-panel rounded-xl border border-white/10 overflow-hidden shadow-2xl z-40 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="h-10 bg-black/40 border-b border-white/10 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-neon-blue" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white">Analyzer</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors font-mono text-sm leading-none">&times;</button>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-mono uppercase">
                        <Cpu className="w-3 h-3" /> Time Complexity
                    </div>
                    <div className="text-2xl font-bold text-neon-blue tracking-tight font-mono">{example.timeComplexity}</div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        Bubble Sort compares adjacent elements and swaps them over multiple passes.
                    </p>
                </div>

                <div className="h-px bg-white/10 w-full" />

                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-mono uppercase">
                        <Cpu className="w-3 h-3" /> Space Complexity
                    </div>
                    <div className="text-2xl font-bold text-neon-purple tracking-tight font-mono">{example.spaceComplexity}</div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        Sorting is done in-place, requiring no additional memory scaling with input size.
                    </p>
                </div>
            </div>
        </div>
    );
}
