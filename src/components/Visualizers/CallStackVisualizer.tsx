import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface CallStackVisualizerProps {
    stack: string[];
    position: [number, number, number];
}

export function CallStackVisualizer({ stack, position }: CallStackVisualizerProps) {
    return (
        <group position={position}>
            {/* Title */}
            <Text
                position={[0, -0.6, 0]}
                fontSize={0.4}
                color="#b538ff"
                anchorX="center"
                anchorY="top"
            >
                CALL STACK
            </Text>

            {/* Stack Frames */}
            {stack.map((frame, idx) => (
                <StackFrame
                    key={idx}
                    name={frame}
                    index={idx}
                />
            ))}
        </group>
    );
}

function StackFrame({ name, index }: { name: string; index: number }) {
    const groupRef = useRef<THREE.Group>(null);

    // Stack grows upwards
    const targetY = index * 0.8;

    useFrame((_state, delta) => {
        if (groupRef.current) {
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 8);
        }
    });

    return (
        <group ref={groupRef} position={[0, targetY - 2, 0]}>
            <Box args={[4, 0.7, 1]}>
                <meshStandardMaterial
                    color="#1a1a2e"
                    emissive="#b538ff"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.8}
                />
                <mesh>
                    <boxGeometry args={[4.02, 0.72, 1.02]} />
                    <meshBasicMaterial color="#b538ff" wireframe />
                </mesh>
            </Box>
            <Text
                position={[0, 0, 0.51]}
                fontSize={0.25}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            >
                {name}
            </Text>
        </group>
    );
}
