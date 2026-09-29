"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const N = 24;
const S = 0.5;
const SEG = N * 10;
const AMP = 0.16;

function makeThread(warp: boolean, i: number, color: string) {
  const half = (N * S) / 2;
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= SEG; k++) {
    const t = (k / SEG) * N * S - half;
    const z = AMP * Math.cos(Math.PI * (t / S + i + (warp ? 0 : 1)));
    pts.push(
      warp
        ? new THREE.Vector3(i * S - half, t, z)
        : new THREE.Vector3(t, i * S - half, z)
    );
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  geo.userData.base = Float32Array.from(geo.attributes.position.array);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Line(geo, mat);
}

function Weave() {
  const group = useRef<THREE.Group>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const camera = useThree((s) => s.camera);
  const viewport = useThree((s) => s.viewport);
  const wide = viewport.width > 10;

  const tools = useMemo(
    () => ({
      ray: new THREE.Raycaster(),
      plane: new THREE.Plane(),
      n: new THREE.Vector3(),
      p: new THREE.Vector3(),
      hit: new THREE.Vector3(),
      ndc: new THREE.Vector2(),
    }),
    []
  );

  const threads = useMemo(() => {
    const out: THREE.Line[] = [];
    for (let i = 0; i < N; i++) {
      out.push(makeThread(true, i, "#FFB84A"));
      out.push(makeThread(false, i, "#2EE6A6"));
    }
    return out;
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    const m = mouse.current;
    g.rotation.z += delta * 0.04;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -1 + m.y * 0.15, 0.05);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, m.x * 0.2, 0.05);

    // Find where the cursor ray meets the weave, then lift threads near it
    g.updateMatrixWorld();
    tools.n.set(0, 0, 1).transformDirection(g.matrixWorld);
    g.getWorldPosition(tools.p);
    tools.plane.setFromNormalAndCoplanarPoint(tools.n, tools.p);
    tools.ndc.set(m.x, m.y);
    tools.ray.setFromCamera(tools.ndc, camera);
    const has = tools.ray.ray.intersectPlane(tools.plane, tools.hit) !== null;
    if (has) g.worldToLocal(tools.hit);

    for (const line of threads) {
      const pos = line.geometry.attributes.position as THREE.BufferAttribute;
      const base = line.geometry.userData.base as Float32Array;
      for (let k = 0; k < pos.count; k++) {
        const bx = base[k * 3];
        const by = base[k * 3 + 1];
        const bz = base[k * 3 + 2];
        let lift = 0;
        if (has) {
          const dx = bx - tools.hit.x;
          const dy = by - tools.hit.y;
          lift = 0.6 * Math.exp(-(dx * dx + dy * dy) / 1.2);
        }
        pos.setZ(k, bz + lift);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group
      ref={group}
      position={[wide ? 3.2 : 0, 0, 0]}
      scale={wide ? 1 : 0.7}
    >
      {threads.map((t, i) => (
        <primitive key={i} object={t} />
      ))}
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 9], fov: 45 }}>
      <color attach="background" args={["#05080d"]} />
      <Weave />
      <EffectComposer>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.15} />
      </EffectComposer>
    </Canvas>
  );
}