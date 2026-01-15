import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useAnatomyStore } from '../store/anatomyStore';
import type { ThreeEvent } from '@react-three/fiber';

interface BodyPartProps {
  name: string;
  position: [number, number, number];
  type: 'sphere' | 'box' | 'cylinder';
}

function BodyPart({ name, position, type }: BodyPartProps) {
  const { selectedPart, selectPart } = useAnatomyStore();
  const isSelected = selectedPart === name;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectPart(name);
  };

  return (
    <mesh position={position} onClick={handleClick}>
      {type === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
      {type === 'box' && <boxGeometry args={[1, 1.5, 0.5]} />}
      {type === 'cylinder' && <cylinderGeometry args={[0.3, 0.3, 2, 32]} />}
      <meshStandardMaterial
        color={isSelected ? '#ef4444' : '#94a3b8'}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function AnatomyScene() {
  const { clearSelection } = useAnatomyStore();

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      onClick={() => clearSelection()}
      style={{ background: '#f1f5f9' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      <BodyPart name="Head" position={[0, 2, 0]} type="sphere" />
      <BodyPart name="Torso" position={[0, 0.5, 0]} type="box" />
      <BodyPart name="Legs" position={[0, -1.5, 0]} type="cylinder" />

      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
      <Environment preset="city" />
    </Canvas>
  );
}
