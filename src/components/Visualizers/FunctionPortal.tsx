import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Ring } from '@react-three/drei';
import * as THREE from 'three';

interface FunctionPortalProps {
    position: [number, number, number];
    functionName: string;
    active: boolean;
}

export function FunctionPortal({ position, functionName, active }: FunctionPortalProps) {
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);

    const timeRef = useRef(0);

    useFrame((_, delta) => {
        timeRef.current += delta;
        if (ring1Ref.current && ring2Ref.current) {
            ring1Ref.current.rotation.z -= delta * 2;
            ring2Ref.current.rotation.z += delta * 1.5;

            // Pulse scale
            const scale = 1 + Math.sin(timeRef.current * 4) * 0.1;
            ring1Ref.current.scale.set(scale, scale, scale);
            ring2Ref.current.scale.set(scale, scale, scale);
        }
    });

    if (!active) return null;

    return (
        <group position={position}>
            {/* Portal Rings */}
            <Ring ref={ring1Ref} args={[1.5, 1.8, 32]}>
                <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={1.5} side={THREE.DoubleSide} transparent opacity={0.8} />
            </Ring>

            <Ring ref={ring2Ref} args={[1.0, 1.3, 32]}>
                <meshStandardMaterial color="#b538ff" emissive="#b538ff" emissiveIntensity={1} side={THREE.DoubleSide} wireframe />
            </Ring>

            {/* Portal Label */}
            <Text
                position={[0, 2.5, 0]}
                fontSize={0.4}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            >
                ENTERING {functionName}()
            </Text>
        </group>
    );
}
