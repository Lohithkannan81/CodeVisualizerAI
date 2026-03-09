import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Text, Sphere } from '@react-three/drei';
import { useExecutionStore } from '../../store/useExecutionStore';

interface LoopTrackProps {
    position?: [number, number, number];
}

export function LoopTrack({ position = [0, -5, 0] }: LoopTrackProps) {
    const steps = useExecutionStore((state) => state.steps);
    const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
    const step = steps[currentStepIndex];

    const groupRef = useRef<any>(null);
    const pointerRef = useRef<any>(null);
    const timeRef = useRef(0);

    const isLooping = step?.action === 'loop_iteration';

    useFrame((_, delta) => {
        timeRef.current += delta;
        if (groupRef.current) {
            groupRef.current.rotation.x = Math.PI / 2;
            groupRef.current.rotation.z = timeRef.current * 0.2;
        }
        if (pointerRef.current) {
            // Animate pointer around the track
            const angle = timeRef.current * 2;
            pointerRef.current.position.x = Math.cos(angle) * 3;
            pointerRef.current.position.y = Math.sin(angle) * 3;
            pointerRef.current.scale.setScalar(isLooping ? 1.5 + Math.sin(timeRef.current * 10) * 0.2 : 1);
        }
    });

    return (
        <group position={position}>
            <Torus ref={groupRef} args={[3, 0.1, 16, 100]}>
                <meshStandardMaterial color="#303030" metalness={1} roughness={0} />
            </Torus>

            <Sphere ref={pointerRef} args={[0.3, 32, 32]} position={[3, 0, 0]}>
                <meshStandardMaterial
                    color={isLooping ? "#00f3ff" : "#bd00ff"}
                    emissive={isLooping ? "#00f3ff" : "#bd00ff"}
                    emissiveIntensity={2}
                />
            </Sphere>

            <Text
                position={[0, 0, 0]}
                fontSize={0.4}
                color="white"
            >
                {isLooping ? "LOOP ITERATION" : "WAITING FOR LOOP"}
            </Text>
        </group>
    );
}
