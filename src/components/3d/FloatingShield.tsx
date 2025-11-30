
/// <reference path="../../react-three-fiber.d.ts" />

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Shield() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.01;
      mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={mesh}>
      <group>
        {/* Shield base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
          <meshStandardMaterial color="#4338CA" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Shield front emblem */}
        <mesh position={[0, 0, 0.05]}>
          <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
          <meshStandardMaterial color="#6D28D9" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Central emblem */}
        <mesh position={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <meshStandardMaterial color="#2563EB" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Lock symbol */}
        <mesh position={[0, 0, 0.2]}>
          <torusGeometry args={[0.3, 0.08, 16, 32]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Lock body */}
        <mesh position={[0, -0.15, 0.2]}>
          <boxGeometry args={[0.3, 0.25, 0.1]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </mesh>
  );
}

export default function FloatingShield() {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[0, 0, 5]} intensity={0.8} />
      <Shield />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
