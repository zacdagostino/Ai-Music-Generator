"use client";

import { Float, MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useMotionPrefs } from "@/components/providers/motion-provider";

type PointerPosition = {
  x: number;
  y: number;
};

type SceneProps = {
  pointer: PointerPosition;
  reduced: boolean;
  scrollProgress: number;
};

const RING_LAYOUT = [
  { position: [-2.2, 1.15, -0.9] as const, scale: 1.2, tilt: 0.65 },
  { position: [2.05, -0.85, -1.3] as const, scale: 0.95, tilt: -0.45 },
  { position: [0, 0.4, -2.2] as const, scale: 2.1, tilt: 0.2 },
];

function deterministicNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function Particles({ reduced, scrollProgress }: { reduced: boolean; scrollProgress: number }) {
  const positions = useMemo(() => {
    const points = new Float32Array(850 * 3);
    for (let i = 0; i < points.length; i += 3) {
      points[i] = (deterministicNoise(i + 1) - 0.5) * 18;
      points[i + 1] = (deterministicNoise(i + 2) - 0.5) * 11;
      points[i + 2] = (deterministicNoise(i + 3) - 0.5) * 10;
    }
    return points;
  }, []);

  const cloudRef = useRef<THREE.Points>(null);

  useFrame((_state, delta) => {
    if (reduced || !cloudRef.current) return;
    cloudRef.current.rotation.y += delta * 0.018;
    cloudRef.current.rotation.x += delta * 0.008;
    const drift = -0.2 + scrollProgress * 0.9;
    cloudRef.current.position.z = THREE.MathUtils.lerp(cloudRef.current.position.z, drift, 0.04);
  });

  return (
    <Points ref={cloudRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#f6e8de"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function GlassCore({ pointer, reduced, scrollProgress }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current || !ringsRef.current) return;

    const elapsed = state.clock.getElapsedTime();
    if (!reduced) {
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.2, 0.03);
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, pointer.x * 0.35, 0.035);
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        pointer.y * 0.25 + scrollProgress * 0.4,
        0.035,
      );

      ringsRef.current.rotation.z = Math.sin(elapsed * 0.25) * 0.12;
      ringsRef.current.rotation.y += delta * 0.06;
      ringsRef.current.position.y = THREE.MathUtils.lerp(ringsRef.current.position.y, -0.2 + scrollProgress * 0.35, 0.035);
    }
  });

  return (
    <>
      <group ref={ringsRef}>
        {RING_LAYOUT.map((ring) => (
          <mesh
            key={`${ring.position[0]}-${ring.position[1]}-${ring.position[2]}`}
            position={ring.position}
            rotation={[ring.tilt, ring.tilt * 0.35, ring.tilt * 0.5]}
            scale={ring.scale}
          >
            <torusGeometry args={[1, 0.03, 32, 160]} />
            <meshStandardMaterial color="#f4d9cc" roughness={0.24} metalness={0.75} emissive="#76574a" emissiveIntensity={0.1} />
          </mesh>
        ))}
      </group>

      <group ref={groupRef} position={[0.1, -0.15, 0]}>
        <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
          <mesh castShadow>
            <icosahedronGeometry args={[1.75, 32]} />
            <MeshDistortMaterial
              color="#e8d4c8"
              speed={reduced ? 0 : 1.35}
              distort={reduced ? 0.02 : 0.22}
              roughness={0.05}
              metalness={0.18}
              emissive="#4f3d34"
              emissiveIntensity={0.06}
              transparent
              opacity={0.84}
            />
          </mesh>
        </Float>
      </group>
    </>
  );
}

function ScrollHalo({ reduced, scrollProgress }: { reduced: boolean; scrollProgress: number }) {
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (!haloRef.current) return;
    if (!reduced) {
      haloRef.current.rotation.x += delta * 0.05;
      haloRef.current.rotation.y += delta * 0.12;
      haloRef.current.rotation.z += delta * 0.07;
    }

    const targetScale = 0.82 + scrollProgress * 0.5;
    haloRef.current.scale.setScalar(THREE.MathUtils.lerp(haloRef.current.scale.x, targetScale, 0.04));
    haloRef.current.position.y = THREE.MathUtils.lerp(haloRef.current.position.y, -1.3 + scrollProgress * 1.25, 0.04);
  });

  return (
    <mesh ref={haloRef} position={[0, -1.3, -0.65]}>
      <torusKnotGeometry args={[1.1, 0.18, 300, 28]} />
      <meshStandardMaterial
        color="#d8cfc7"
        roughness={0.22}
        metalness={0.55}
        emissive="#5f5148"
        emissiveIntensity={0.08}
        transparent
        opacity={0.52}
      />
    </mesh>
  );
}

function CameraRig({
  pointer,
  reduced,
  scrollProgress,
}: {
  pointer: PointerPosition;
  reduced: boolean;
  scrollProgress: number;
}) {
  useFrame((state) => {
    const camera = state.camera;
    const targetX = reduced ? 0 : pointer.x * 0.38;
    const targetY = reduced ? 0 : pointer.y * 0.24 + scrollProgress * 0.22;
    const targetZ = 7.1 - scrollProgress * 1.45;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.035);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.035);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function WebglHeroScene({
  pointer,
  scrollProgress,
}: {
  pointer: PointerPosition;
  scrollProgress: number;
}) {
  const { reduced } = useMotionPrefs();

  return (
    <div className="pointer-events-none absolute inset-0 -z-20">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 7], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : "always"}
      >
        <color attach="background" args={["#f2eee7"]} />
        <fog attach="fog" args={["#f2eee7", 5.5, 14]} />
        <ambientLight intensity={0.85} />
        <hemisphereLight intensity={0.65} color="#fff4e9" groundColor="#b7b0a9" />
        <directionalLight position={[4, 5, 6]} intensity={0.85} color="#ffe4d5" />
        <pointLight position={[-3.5, -2.2, 2]} intensity={0.45} color="#d0e4d7" />
        <Particles reduced={reduced} scrollProgress={scrollProgress} />
        <GlassCore pointer={pointer} reduced={reduced} scrollProgress={scrollProgress} />
        <ScrollHalo reduced={reduced} scrollProgress={scrollProgress} />
        <CameraRig pointer={pointer} reduced={reduced} scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
