import { useEffect, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useExecutionStore } from '../store/useExecutionStore';
import { Play } from 'lucide-react';

export function EditorPanel() {
    const code = useExecutionStore((state) => state.code);
    const setCode = useExecutionStore((state) => state.setCode);
    const language = useExecutionStore((state) => state.language);
    const setLanguage = useExecutionStore((state) => state.setLanguage);
    const steps = useExecutionStore((state) => state.steps);
    const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
    const runCode = useExecutionStore((state) => state.runCode);
    const isCompiling = useExecutionStore((state) => state.isCompiling);

    const monaco = useMonaco();
    const editorRef = useRef<any>(null);
    const decorationsRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    useEffect(() => {
        if (!monaco || !editorRef.current || steps.length === 0) return;

        const step = steps[currentStepIndex];
        const line = step?.lineIndex || 1;

        if (decorationsRef.current) {
            decorationsRef.current.clear();
        }

        decorationsRef.current = editorRef.current.createDecorationsCollection([
            {
                range: new monaco.Range(line, 1, line, 1),
                options: {
                    isWholeLine: true,
                    className: 'active-line-highlight',
                    glyphMarginClassName: 'active-line-glyph',
                }
            }
        ]);

        editorRef.current.revealLineInCenterIfOutsideViewport(line, 0);

    }, [currentStepIndex, steps, monaco]);

    return (
        <div className="flex-1 relative bg-[#1e1e1e] border-t border-b border-white/5 flex flex-col">
            <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-black/20 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Editor</span>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#2a2a3b] text-xs font-mono text-neon-blue border border-white/10 rounded px-2 py-1 outline-none"
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                </div>

                <button
                    onClick={runCode}
                    disabled={isCompiling}
                    className="flex items-center gap-2 px-4 py-1.5 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue rounded text-xs font-mono font-bold transition-colors disabled:opacity-50"
                >
                    <Play className="w-3.5 h-3.5" />
                    {isCompiling ? 'RUNNING...' : 'RUN CODE'}
                </button>
            </div>
            <div className="flex-1 relative py-2 editor-container">
                <Editor
                    height="100%"
                    language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        lineHeight: 24,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        formatOnType: true,
                        readOnly: false, // Now editable!
                        glyphMargin: true,
                    }}
                />
            </div>
        </div>
    );
}
