import { Play, Pause, StepForward, StepBack, RotateCcw, Network } from 'lucide-react';
import { useExecutionStore } from '../store/useExecutionStore';

export function ControlsPanel() {
    const isPlaying = useExecutionStore((state) => state.isPlaying);
    const play = useExecutionStore((state) => state.play);
    const pause = useExecutionStore((state) => state.pause);
    const stepForward = useExecutionStore((state) => state.stepForward);
    const stepBack = useExecutionStore((state) => state.stepBack);
    const reset = useExecutionStore((state) => state.reset);
    const setSpeed = useExecutionStore((state) => state.setSpeed);
    const playSpeed = useExecutionStore((state) => state.playSpeed);
    const algorithmMode = useExecutionStore((state) => state.algorithmMode);
    const toggleAlgorithmMode = useExecutionStore((state) => state.toggleAlgorithmMode);

    // Timeline variables
    const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
    const steps = useExecutionStore((state) => state.steps);
    const setStep = useExecutionStore((state) => state.setStep);
    const totalSteps = Math.max(0, steps.length - 1);

    return (
        <div className="h-28 border-t border-white/10 flex flex-col justify-center px-6 gap-3 bg-black/40 shrink-0 z-20">
            {/* Timeline Slider */}
            <div className="flex items-center gap-3 w-full">
                <span className="text-[10px] text-gray-500 font-mono w-4">{currentStepIndex}</span>
                <input
                    type="range"
                    min={0}
                    max={totalSteps}
                    value={currentStepIndex}
                    onChange={(e) => setStep(Number(e.target.value))}
                    className="flex-1 accent-neon-blue h-1 bg-white/10 rounded-full appearance-none outline-none overflow-hidden"
                />
                <span className="text-[10px] text-gray-500 font-mono w-4">{totalSteps}</span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        title="Reset"
                        onClick={reset}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 border border-white/10 rounded-full px-2 py-1 bg-black/50">
                        <button
                            title="Step Back"
                            onClick={stepBack}
                            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-gray-300"
                        >
                            <StepBack className="w-4 h-4" />
                        </button>
                        <button
                            title="Play/Pause"
                            onClick={isPlaying ? pause : play}
                            className="p-2.5 rounded-full bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue transition-colors shadow-[0_0_15px_rgba(0,243,255,0.2)]"
                        >
                            {isPlaying ? <Pause className="w-5 h-5 ml-0.5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <button
                            title="Step Forward"
                            onClick={stepForward}
                            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-gray-300"
                        >
                            <StepForward className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleAlgorithmMode}
                        className={`text-[10px] font-mono border px-2 py-1 flex items-center gap-1 rounded transition-colors ${algorithmMode
                            ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                            : 'bg-transparent border-white/10 text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Network className="w-3 h-3" />
                        ALGORITHM MODE
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-mono">SPEED {playSpeed}x</span>
                        <input
                            type="range"
                            min="0.5" max="3" step="0.5"
                            value={playSpeed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-24 accent-neon-purple"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
