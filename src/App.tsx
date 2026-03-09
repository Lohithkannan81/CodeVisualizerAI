import { useEffect, useState } from 'react';
import { CodeSquare, Settings } from 'lucide-react';
import { EditorPanel } from './components/EditorPanel';
import { ControlsPanel } from './components/ControlsPanel';
import { AIPanel } from './components/AIPanel';
import { Scene3D } from './components/Scene3D';
import { ComplexityAnalyzer } from './components/ComplexityAnalyzer';
import { ExamplesMenu } from './components/ExamplesMenu';
import { InputPanel } from './components/InputPanel';
import { useExecutionStore } from './store/useExecutionStore';
import { ConsolePanel } from './components/ConsolePanel';

function App() {
  const isPlaying = useExecutionStore((state) => state.isPlaying);
  const playSpeed = useExecutionStore((state) => state.playSpeed);
  const tick = useExecutionStore((state) => state.tick);

  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    let intervalId: number;
    if (isPlaying) {
      // Base speed is e.g. 1500ms per step. If playSpeed is 2x, it's 750ms.
      const intervalMs = 1500 / playSpeed;
      intervalId = window.setInterval(() => {
        tick();
      }, intervalMs);
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isPlaying, playSpeed, tick]);

  return (
    <div className="flex flex-col h-screen w-screen bg-cyber-bg text-white overflow-hidden selection:bg-neon-blue/30 font-sans">

      {/* Header */}
      <header className="h-14 glass-panel border-b border-white/10 flex items-center justify-between px-6 z-10 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <CodeSquare className="w-6 h-6 text-neon-blue" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Code Execution Universe
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
            <button
              onClick={() => { setShowExamples(!showExamples); setShowAnalyzer(false); }}
              className={"text-sm font-medium transition-colors " + (showExamples ? "text-neon-green" : "text-gray-300 hover:text-white")}
            >
              Examples
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => { setShowAnalyzer(!showAnalyzer); setShowExamples(false); }}
              className={"text-sm font-medium transition-colors " + (showAnalyzer ? "text-neon-blue" : "text-gray-300 hover:text-white")}
            >
              Analyzer
            </button>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-row overflow-hidden relative">
        {showAnalyzer && <ComplexityAnalyzer onClose={() => setShowAnalyzer(false)} />}
        {showExamples && <ExamplesMenu onClose={() => setShowExamples(false)} />}

        {/* Left Panel: Code Editor & Controls */}
        <section className="w-[450px] lg:w-[500px] flex flex-col glass-panel border-r border-white/10 z-10 shrink-0 relative shadow-2xl">
          <EditorPanel />
          <InputPanel />
          <ConsolePanel />
          <ControlsPanel />
        </section>

        {/* Center/Right Panel: 3D Universe */}
        <section className="flex-1 relative overflow-hidden bg-black/90">
          <Scene3D />
          <AIPanel />
        </section>

      </main>
    </div>
  )
}

export default App
