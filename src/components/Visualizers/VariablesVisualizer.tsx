import { Text, RoundedBox, Float } from '@react-three/drei';
import { useExecutionStore } from '../../store/useExecutionStore';

interface VariablesVisualizerProps {
    position?: [number, number, number];
}

export function VariablesVisualizer({ position = [0, 4, 0] }: VariablesVisualizerProps) {
    const steps = useExecutionStore((state) => state.steps);
    const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
    const step = steps[currentStepIndex];

    const variables = step?.variables || {};
    const varKeys = Object.keys(variables);

    return (
        <group position={position}>
            {varKeys.map((name, index) => {
                const value = variables[name];
                const isActive = step?.actionData?.name === name && (step?.action === 'update_variable' || step?.action === 'create_variable');

                return (
                    <group key={name} position={[index * 2.5 - (varKeys.length - 1) * 1.25, 0, 0]}>
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <mesh>
                                <RoundedBox
                                    args={[1, 1, 1]}
                                    radius={0.1}
                                    smoothness={4}
                                    scale={isActive ? 1.2 : 1}
                                >
                                    <meshStandardMaterial
                                        color={isActive ? "#00f3ff" : "#bd00ff"}
                                        emissive={isActive ? "#00f3ff" : "#bd00ff"}
                                        emissiveIntensity={isActive ? 1 : 0.2}
                                        transparent
                                        opacity={0.8}
                                    />
                                </RoundedBox>
                            </mesh>
                        </Float>

                        <Text
                            position={[0, 1, 0]}
                            fontSize={0.25}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {name}
                        </Text>

                        <Text
                            position={[0, 0, 0.6]}
                            fontSize={0.4}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                            fontWeight="bold"
                        >
                            {String(value)}
                        </Text>
                    </group>
                );
            })}
        </group>
    );
}
