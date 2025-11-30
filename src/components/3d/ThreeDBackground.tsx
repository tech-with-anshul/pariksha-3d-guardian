
/// <reference path="../../react-three-fiber.d.ts" />

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, Suspense } from "react";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingSphere({
  position,
  color,
  scale,
  speed,
  distort,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
  speed: number;
  distort: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      mesh.current.rotation.y += 0.01 * speed;
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      scale={hovered ? scale * 1.1 : scale}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <MeshDistortMaterial
        color={color}
        distort={distort}
        speed={0.8}
        roughness={0.2}
        metalness={0.8}
        opacity={0.8}
        transparent
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <FloatingSphere position={[-4, 0, -5]} color="#4338CA" scale={1.5} speed={0.6} distort={0.4} />
      <FloatingSphere position={[4, -2, -10]} color="#6D28D9" scale={2} speed={0.3} distort={0.3} />
      <FloatingSphere position={[0, 3, -8]} color="#2563EB" scale={1} speed={0.8} distort={0.5} />
    </>
  );
}

export default function ThreeDBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Suspense fallback={<div className="w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900" />}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
