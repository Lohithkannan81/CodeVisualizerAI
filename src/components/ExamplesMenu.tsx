import { BookOpen, ChevronRight } from 'lucide-react';
import { useExecutionStore } from '../store/useExecutionStore';
import { examples } from '../examples';

interface ExamplesMenuProps {
    onClose: () => void;
}

export function ExamplesMenu({ onClose }: ExamplesMenuProps) {
    const loadExample = useExecutionStore(state => state.loadExample);

    const handleSelect = (id: string) => {
        loadExample(id);
        onClose();
    };

    return (
        <div className="absolute top-16 right-32 w-80 glass-panel rounded-xl border border-white/10 overflow-hidden shadow-2xl z-40 animate-in fade-in slide-in-from-top-4 duration-200 bg-[#09090b]/95">
            <div className="h-10 bg-black/40 border-b border-white/10 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-neon-green" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white">Examples Library</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors font-mono text-sm leading-none">&times;</button>
            </div>

            <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                {Object.values(examples).map(ex => (
                    <button
                        key={ex.id}
                        onClick={() => handleSelect(ex.id)}
                        className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors group flex items-start justify-between border border-transparent hover:border-white/5"
                    >
                        <div className="space-y-1">
                            <div className="font-semibold text-sm text-gray-200 group-hover:text-neon-green transition-colors">{ex.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-2 pr-4">{ex.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-neon-green shrink-0 mt-1 transition-colors" />
                    </button>
                ))}

                <div className="p-3">
                    <div className="text-xs text-gray-500 italic text-center">More examples coming soon...</div>
                </div>
            </div>
        </div>
    );
}
