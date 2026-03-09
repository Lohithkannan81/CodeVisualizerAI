import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useExecutionStore } from '../../store/useExecutionStore';

interface ArrayBlockProps {
    value: number | string;
    index: number;
    highlighted: boolean;
    swapping: boolean;
    totalLength: number;
}

export function ArrayBlock({ value, index, highlighted, swapping, totalLength }: ArrayBlockProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Calculate target position based on index to center the array
    const spacing = 1.6;
    const startX = -((totalLength - 1) * spacing) / 2;
    const targetX = startX + index * spacing;

    // Target Y: slightly elevated if swapping
    const targetY = swapping ? 1.5 : 0;

    // Target Z: pushing forward slightly if swapping to avoid passing through each other
    const targetZ = swapping ? (index % 2 === 0 ? 0.5 : -0.5) : 0;

    const timeRef = useRef(0);

    useFrame((_, delta) => {
        timeRef.current += delta;
        if (meshRef.current) {
            // Smooth interpolation for position
            meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 5);
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 5);
            meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 5);

            // Add slight floating animation when not swapping
            if (!swapping) {
                meshRef.current.position.y += Math.sin(timeRef.current * 2 + index) * 0.002;
            }
        }
    });

    const baseColor = highlighted ? "#00f3ff" : (swapping ? "#b538ff" : "#1a1a2e");
    const emissiveColor = highlighted ? "#00f3ff" : (swapping ? "#b538ff" : "#000000");
    const emissiveIntensity = highlighted ? 0.8 : (swapping ? 1 : 0.2);

    return (
        <group>
            <RoundedBox ref={meshRef} args={[1.2, 1.2, 1.2]} radius={0.15} position={[targetX, 0, 0]}>
                <meshStandardMaterial
                    color={baseColor}
                    emissive={emissiveColor}
                    emissiveIntensity={emissiveIntensity}
                    roughness={0.2}
                    metalness={0.8}
                />
                {/* Outline effect (wireframe overlay) */}
                <mesh>
                    <boxGeometry args={[1.21, 1.21, 1.21]} />
                    <meshBasicMaterial color={highlighted ? "#ffffff" : "#00f3ff"} wireframe transparent opacity={0.3} />
                </mesh>

                {/* Text inside the cube */}
                <Text
                    position={[0, 0, 0.61]}
                    fontSize={0.6}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    {String(value)}
                </Text>
            </RoundedBox>
        </group>
    );
}

interface ArrayVisualizerProps {
    arrayState: {
        id: string;
        values: number[];
        highlights: number[];
        swapping: number[];
    };
    position: [number, number, number];
}

export function ArrayVisualizer({ arrayState, position }: ArrayVisualizerProps) {
    const steps = useExecutionStore((state) => state.steps);
    const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
    const step = steps[currentStepIndex];

    // Determine highlights/swapping based on the current step's action
    let highlights = [...arrayState.highlights];
    let swapping = [...arrayState.swapping];

    if (step && step.actionData && step.actionData.name === arrayState.id) {
        if (step.action === 'array_insert') {
            highlights = [step.actionData.index];
        } else if (step.action === 'array_swap') {
            swapping = [step.actionData.index, step.actionData.swapWith];
        }
    }

    return (
        <group position={position}>
            {/* Array Label */}
            <Text
                position={[0, 2, 0]}
                fontSize={0.5}
                color="#00ff66"
                anchorX="center"
                anchorY="bottom"
            >
                {arrayState.id}
            </Text>

            {/* Array Elements */}
            {arrayState.values.map((val, idx) => (
                <ArrayBlock
                    key={`${arrayState.id}-${idx}-${val}`}
                    value={val}
                    index={idx}
                    highlighted={highlights.includes(idx)}
                    swapping={swapping.includes(idx)}
                    totalLength={arrayState.values.length}
                />
            ))}
        </group>
    );
}
