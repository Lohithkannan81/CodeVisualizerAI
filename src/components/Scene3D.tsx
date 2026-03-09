import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import { useExecutionStore } from '../store/useExecutionStore';
import { ArrayVisualizer } from './Visualizers/ArrayVisualizer';
import { VariablesVisualizer } from './Visualizers/VariablesVisualizer';
import { CallStackVisualizer } from './Visualizers/CallStackVisualizer';
import { LoopTrack } from './Visualizers/LoopTrack';
import { FunctionPortal } from './Visualizers/FunctionPortal';

export function Scene3D() {
    const steps = useExecutionStore((state) => state.steps);
    const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
    const currentStep = steps[currentStepIndex];

    const isCalling = currentStep?.explanation.toLowerCase().includes('calling function');
    const functionMatch = currentStep?.explanation.match(/Calling function ([\w_]+)\(\)/);
    const activeFunction = functionMatch ? functionMatch[1] : '';

    return (
        <div className="absolute inset-0 bg-cyber-bg">
            <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
                {/* Environment */}
                <color attach="background" args={['#050508']} />
                <fog attach="fog" args={['#050508', 10, 40]} />

                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[0, 5, 0]} intensity={2} color="#00f3ff" distance={20} />
                <pointLight position={[-5, 5, -5]} intensity={1.5} color="#b538ff" distance={20} />

                {/* Cyber Neon Grid */}
                <Grid
                    position={[0, -1, 0]}
                    args={[20, 20]}
                    cellSize={1}
                    cellThickness={1}
                    cellColor="#00f3ff"
                    sectionSize={5}
                    sectionThickness={1.5}
                    sectionColor="#b538ff"
                    fadeDistance={30}
                    fadeStrength={1}
                />

                {/* Floating Particles/Stars */}
                <Stars radius={50} depth={50} count={2000} factor={4} saturation={1} fade speed={1} />

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    makeDefault
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2.1}
                />

                {/* Dynamic Execution Memory State */}
                {currentStep && (
                    <group>
                        {/* Render Arrays */}
                        {currentStep.arrays?.map((arr, idx) => (
                            <ArrayVisualizer key={arr.id} arrayState={arr} position={[0, 0, idx * 3]} />
                        ))}

                        {/* Render Variables */}
                        {currentStep.variables && Object.keys(currentStep.variables).length > 0 && (
                            <VariablesVisualizer position={[0, 4, -4]} />
                        )}

                        {/* Render Call Stack */}
                        {currentStep.callStack && currentStep.callStack.length > 0 && (
                            <CallStackVisualizer stack={currentStep.callStack} position={[-6, 0, -2]} />
                        )}

                        {/* Special Visualizers based on AI trace */}
                        <LoopTrack position={[6, 0, -2]} />
                        <FunctionPortal position={[0, 4, -8]} functionName={activeFunction} active={!!isCalling} />
                    </group>
                )}

            </Canvas>
        </div>
    );
}
