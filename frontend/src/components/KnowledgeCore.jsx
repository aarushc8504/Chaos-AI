import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

function Core() {
  const coreRef = React.useRef();
  const ringRef = React.useRef();
  const ring2Ref = React.useRef();

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.18;
      coreRef.current.rotation.y += delta * 0.3;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.12;
      ringRef.current.rotation.z += delta * 0.2;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.16;
      ring2Ref.current.rotation.x += delta * 0.08;
    }

    if (coreRef.current) {
      const distance = state.pointer.distanceTo(new THREE.Vector2(0, 0));
      const scale = 1 + Math.min(distance, 0.8) * 0.08;
      coreRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <Float
        speed={1.2}
        rotationIntensity={0.35}
        floatIntensity={0.45}
      >
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.25, 2]} />
          <meshStandardMaterial
            color="#d4d4d8"
            roughness={0.25}
            metalness={0.8}
            wireframe
            transparent
            opacity={0.9}
          />
        </mesh>

        <mesh scale={0.62}>
          <icosahedronGeometry args={[1.25, 2]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>

        <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.65, 0.018, 16, 120]} />
          <meshBasicMaterial
            color="#71717a"
            transparent
            opacity={0.75}
          />
        </mesh>

        <mesh
          ref={ring2Ref}
          rotation={[0.8, 0.4, 0]}
        >
          <torusGeometry args={[1.9, 0.012, 16, 120]} />
          <meshBasicMaterial
            color="#52525b"
            transparent
            opacity={0.65}
          />
        </mesh>
      </Float>

      <pointLight
        position={[2, 2, 3]}
        intensity={5}
        distance={8}
      />

      <pointLight
        position={[-3, -2, -2]}
        intensity={2}
        distance={7}
      />
    </group>
  );
}

function KnowledgeCore() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
        }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.45} />

        <Stars
          radius={35}
          depth={20}
          count={700}
          factor={1.5}
          saturation={0}
          fade
          speed={0.25}
        />

        <Core />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.25}
          minPolarAngle={Math.PI / 2.4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}

export default KnowledgeCore;