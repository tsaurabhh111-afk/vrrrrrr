import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, useCursor, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationState } from '../types';

// Materials
const metalMaterial = new THREE.MeshStandardMaterial({ color: '#555', metalness: 0.8, roughness: 0.2 });
const plasticMaterial = new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.8 });
const resistorBodyMat = new THREE.MeshStandardMaterial({ color: '#d4a373' });
const wireMaterial = new THREE.MeshStandardMaterial({ color: '#ef4444' });

interface LabSceneProps {
  simState: SimulationState;
  setSimState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

const Cable = ({ start, end, color = '#ef4444' }: { start: [number, number, number], end: [number, number, number], color?: string }) => {
    const points = useMemo(() => {
        const p1 = new THREE.Vector3(...start);
        const p2 = new THREE.Vector3(...end);
        const dist = p1.distanceTo(p2);
        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        mid.y += dist * 0.5; // Droop upwards/gravity style
        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        return curve.getPoints(20);
    }, [start, end]);

    return (
        <line>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length}
                    array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={3} />
        </line>
    );
}

const Resistor = () => {
  return (
    <group position={[2, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh material={resistorBodyMat}>
        <cylinderGeometry args={[0.3, 0.3, 2, 32]} />
      </mesh>
      {/* Bands */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.2, 32]} />
        <meshBasicMaterial color="brown" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.2, 32]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.2, 32]} />
        <meshBasicMaterial color="green" />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.2, 32]} />
        <meshBasicMaterial color="gold" />
      </mesh>
      {/* Leads */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial color="#ccc" metalness={1} roughness={0} />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial color="#ccc" metalness={1} roughness={0} />
      </mesh>
      
      <Html position={[1, 0, 0]} transform>
        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs whitespace-nowrap">High R (Unknown)</div>
      </Html>
    </group>
  );
};

const Capacitor = () => {
  return (
    <group position={[-2, 0.6, 0]}>
      <mesh material={plasticMaterial}>
        <cylinderGeometry args={[0.8, 0.8, 2.5, 32]} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
         <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
         <meshStandardMaterial color="#ccc" metalness={1} roughness={0} />
      </mesh>
      <mesh position={[0.4, 1.3, 0]}>
         <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
         <meshStandardMaterial color="#ccc" metalness={1} roughness={0} />
      </mesh>
      <Html position={[0, 1.5, 0]} transform>
        <div className="bg-blue-900/80 text-white px-2 py-1 rounded text-xs">C = 10µF</div>
      </Html>
    </group>
  );
};

const Multimeter = ({ voltage }: { voltage: number }) => {
  return (
    <group position={[0, 0, 2]} rotation={[-0.5, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1, 4]} />
        <meshStandardMaterial color="#fca5a5" /> 
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.71, -1]}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial color="#9ca3af" />
      </mesh>
      <Text
        position={[0, 0.72, -1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {voltage.toFixed(2)} V
      </Text>
      
      <Html position={[0, 1, 1]} transform>
        <div className="text-xs text-white bg-red-800 px-1 rounded">Electrometer</div>
      </Html>
    </group>
  );
};

const PowerSupply = () => {
    return (
        <group position={[-4, 1, -2]}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[3, 2, 2]} />
                <meshStandardMaterial color="#334155" />
            </mesh>
            <Text position={[0, 0, 1.01]} fontSize={0.3} color="white">DC SOURCE</Text>
            {/* Fix: Moved rotation from geometry to mesh */}
            <mesh position={[0.5, 0, 1.05]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.2]} />
                <meshStandardMaterial color="red" />
            </mesh>
            {/* Fix: Moved rotation from geometry to mesh */}
            <mesh position={[-0.5, 0, 1.05]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.2]} />
                <meshStandardMaterial color="black" />
            </mesh>
        </group>
    )
}

const Switch = ({ position, onClick }: { position: 'charge' | 'discharge' | 'open', onClick: () => void }) => {
    const [hovered, setHover] = React.useState(false);
    useCursor(hovered);

    const rotation = position === 'charge' ? -0.4 : position === 'discharge' ? 0.4 : 0;
    const color = position === 'charge' ? '#22c55e' : position === 'discharge' ? '#ef4444' : '#fbbf24';

    return (
        <group position={[3, 0.2, 2]} onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2, 0.2, 1]} />
                <meshStandardMaterial color="#475569" />
            </mesh>
             {/* Lever Base */}
             <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>
            {/* Lever */}
            <mesh position={[0, 0.5, 0]} rotation={[0, 0, rotation]}>
                <cylinderGeometry args={[0.1, 0.1, 1]} />
                <meshStandardMaterial color={color} />
            </mesh>
             <Html position={[0, 1.5, 0]} center>
                <div className={`px-2 py-1 rounded font-bold text-xs select-none pointer-events-none ${hovered ? 'bg-white text-black' : 'bg-black/50 text-white'}`}>
                    Click to Toggle
                    <br/>
                    {position.toUpperCase()}
                </div>
            </Html>
        </group>
    )
}


export const LabScene: React.FC<LabSceneProps> = ({ simState, setSimState }) => {
  const toggleSwitch = () => {
    setSimState(prev => {
        let nextPos: 'charge' | 'discharge' | 'open' = 'open';
        if (prev.switchPosition === 'open') nextPos = 'charge';
        else if (prev.switchPosition === 'charge') nextPos = 'discharge';
        else if (prev.switchPosition === 'discharge') nextPos = 'open';
        
        return {
            ...prev,
            switchPosition: nextPos
        }
    });
  };

  return (
    <Canvas shadows camera={{ position: [0, 8, 10], fov: 45 }}>
      <color attach="background" args={['#1e1b4b']} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      
      <group position={[0, -1, 0]}>
        {/* Table */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[20, 10]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        <PowerSupply />
        <Capacitor />
        <Resistor />
        <Multimeter voltage={simState.voltage} />
        <Switch position={simState.switchPosition} onClick={toggleSwitch} />

        {/* Wires - Conceptual connections */}
        <Cable start={[-3.5, 1, -1]} end={[-2, 1.3, 0]} color="red" /> {/* Source to Cap */}
        <Cable start={[-2, 1.3, 0]} end={[0, 0.2, 2]} color="red" /> {/* Cap to Meter */}
        <Cable start={[0, 0.2, 2]} end={[2, 1.5, 0]} color="red" /> {/* Meter to Resistor */}
        <Cable start={[2, 1.5, 0]} end={[3, 0.2, 2]} color="red" /> {/* Resistor to Switch */}
      </group>

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
};