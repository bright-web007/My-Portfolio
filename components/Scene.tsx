// "use client";
// import { useEffect, useMemo, useRef } from "react";
// import * as THREE from "three";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { EffectComposer, Bloom } from "@react-three/postprocessing";
// import { Html } from "@react-three/drei";
// import { useGame } from "@/store/useGame";
// import { SKILLS, GROUP_COLOR, type Skill } from "@/lib/Skills";

// const N = 24;
// const S = 0.5;
// const SEG = N * 10;
// const AMP = 0.16;
// const TAU = Math.PI * 2;

// function makeThread(warp: boolean, i: number, color: string) {
//   const half = (N * S) / 2;
//   const pts: THREE.Vector3[] = [];
//   for (let k = 0; k <= SEG; k++) {
//     const t = (k / SEG) * N * S - half;
//     const z = AMP * Math.cos(Math.PI * (t / S + i + (warp ? 0 : 1)));
//     pts.push(
//       warp
//         ? new THREE.Vector3(i * S - half, t, z)
//         : new THREE.Vector3(t, i * S - half, z)
//     );
//   }
//   const geo = new THREE.BufferGeometry().setFromPoints(pts);
//   geo.userData.base = Float32Array.from(geo.attributes.position.array);
//   const mat = new THREE.LineBasicMaterial({
//     color,
//     transparent: true,
//     opacity: 0.85,
//     blending: THREE.AdditiveBlending,
//   });
//   return new THREE.Line(geo, mat);
// }

// function Knot({ skill }: { skill: Skill }) {
//   const mesh = useRef<THREE.Mesh>(null!);
//   const select = useGame((s) => s.select);
//   const done = useGame((s) => s.achievements.includes(`skill-${skill.id}`));
//   const active = useGame((s) => s.selected === skill.id);
//   const color = GROUP_COLOR[skill.group];

//   useFrame((state) => {
//     const t = state.clock.elapsedTime;
//     const size = active ? 1.7 : done ? 1 : 1 + Math.sin(t * 2.4 + skill.x) * 0.25;
//     mesh.current.scale.setScalar(size);
//   });

//   return (
//     <group position={[skill.x, skill.y, 0.45]}>
//       <mesh ref={mesh}>
//         <sphereGeometry args={[0.2, 24, 24]} />
//         <meshBasicMaterial
//           color={color}
//           toneMapped={false}
//           transparent
//           opacity={done ? 1 : 0.75}
//         />
//       </mesh>
//       <Html center position={[0, -0.55, 0]} zIndexRange={[5, 0]}>
//         <button
//           data-cursor="OPEN"
//           aria-label={`Open ${skill.name}`}
//           onClick={() => select(skill.id)}
//           className="whitespace-nowrap border px-2 py-1 font-mono text-[11px] transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-white"
//           style={{
//             color,
//             borderColor: color,
//             background: done ? `${color}22` : "rgba(5,8,13,.8)",
//           }}
//         >
//           {skill.name}
//         </button>
//       </Html>
//     </group>
//   );
// }

// function Weave() {
//   const group = useRef<THREE.Group>(null!);
//   const mouse = useRef({ x: 0, y: 0 });
//   const camera = useThree((s) => s.camera);
//   const viewport = useThree((s) => s.viewport);
//   const wide = viewport.width > 10;
//   const inSkills = useGame((s) => s.section) === "skills";

//   const tools = useMemo(
//     () => ({
//       ray: new THREE.Raycaster(),
//       plane: new THREE.Plane(),
//       n: new THREE.Vector3(),
//       p: new THREE.Vector3(),
//       hit: new THREE.Vector3(),
//       ndc: new THREE.Vector2(),
//     }),
//     []
//   );

//   const threads = useMemo(() => {
//     const out: THREE.Line[] = [];
//     for (let i = 0; i < N; i++) {
//       out.push(makeThread(true, i, "#FFB84A"));
//       out.push(makeThread(false, i, "#2EE6A6"));
//     }
//     return out;
//   }, []);

//   useEffect(() => {
//     const onMove = (e: PointerEvent) => {
//       mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
//       mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
//     };
//     window.addEventListener("pointermove", onMove);
//     return () => window.removeEventListener("pointermove", onMove);
//   }, []);

//   useFrame((_, delta) => {
//     const g = group.current;
//     const m = mouse.current;
//     const lerp = THREE.MathUtils.lerp;

//     const targetX = inSkills ? 0 : wide ? 3.2 : 0;
//     const targetScale = inSkills
//       ? Math.min(1.05, viewport.width / 11)
//       : wide
//       ? 1
//       : 0.7;
//     const tiltX = inSkills ? -0.75 + m.y * 0.1 : -1 + m.y * 0.15;

//     g.position.x = lerp(g.position.x, targetX, 0.06);
//     g.scale.setScalar(lerp(g.scale.x, targetScale, 0.06));
//     g.rotation.x = lerp(g.rotation.x, tiltX, 0.05);
//     g.rotation.y = lerp(g.rotation.y, m.x * (inSkills ? 0.1 : 0.2), 0.05);

//     if (inSkills) {
//       // Settle the spin so knots hold still and are easy to click
//       let z = g.rotation.z % TAU;
//       if (z > Math.PI) z -= TAU;
//       if (z < -Math.PI) z += TAU;
//       g.rotation.z = lerp(z, 0, 0.06);
//     } else {
//       g.rotation.z += delta * 0.04;
//     }

//     // Find where the cursor ray meets the weave, then lift threads near it
//     g.updateMatrixWorld();
//     tools.n.set(0, 0, 1).transformDirection(g.matrixWorld);
//     g.getWorldPosition(tools.p);
//     tools.plane.setFromNormalAndCoplanarPoint(tools.n, tools.p);
//     tools.ndc.set(m.x, m.y);
//     tools.ray.setFromCamera(tools.ndc, camera);
//     const has = tools.ray.ray.intersectPlane(tools.plane, tools.hit) !== null;
//     if (has) g.worldToLocal(tools.hit);

//     for (const line of threads) {
//       const pos = line.geometry.attributes.position as THREE.BufferAttribute;
//       const base = line.geometry.userData.base as Float32Array;
//       for (let k = 0; k < pos.count; k++) {
//         const bx = base[k * 3];
//         const by = base[k * 3 + 1];
//         const bz = base[k * 3 + 2];
//         let lift = 0;
//         if (has) {
//           const dx = bx - tools.hit.x;
//           const dy = by - tools.hit.y;
//           lift = 0.6 * Math.exp(-(dx * dx + dy * dy) / 1.2);
//         }
//         pos.setZ(k, bz + lift);
//       }
//       pos.needsUpdate = true;
//     }
//   });

//   return (
//     <group
//       ref={group}
//       position={[wide ? 3.2 : 0, 0, 0]}
//       scale={wide ? 1 : 0.7}
//     >
//       {threads.map((t, i) => (
//         <primitive key={i} object={t} />
//       ))}
//       {inSkills && SKILLS.map((s) => <Knot key={s.id} skill={s} />)}
//     </group>
//   );
// }

// export default function Scene() {
//   return (
//     <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 9], fov: 45 }}>
//       <color attach="background" args={["#05080d"]} />
//       <Weave />
//       <EffectComposer>
//         <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.15} />
//       </EffectComposer>
//     </Canvas>
//   );
// }





"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Html, Line } from "@react-three/drei";
import { useGame } from "@/store/useGame";
import { CATEGORIES, type Category, type Skill } from "@/lib/Skills";

const N = 24;
const S = 0.5;
const SEG = N * 10;
const AMP = 0.16;
const TAU = Math.PI * 2;
const TILT = 0.75;
const RING_RADIUS = 2.2;
const ORB_R = 0.55;
const SUN_R = 0.6;
const OUTER = Math.max(...CATEGORIES.map((c) => c.orbit));

const lerp = THREE.MathUtils.lerp;
const secondColor = (c: string) => (c === "#FFB84A" ? "#2EE6A6" : "#FFB84A");

// Shared between components, updated every frame
const weaveScale = { v: 1 };
const orbPos: Record<string, { x: number; y: number }> = {};

// Orbs keep a steady on-screen size; smaller on narrow screens
const orbSize = (viewportWidth: number) =>
  Math.min(0.7, Math.max(0.35, viewportWidth / 11));

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

type OrbMat = { mat: THREE.LineBasicMaterial; base: number };

function buildOrb(
  color: string,
  second: string,
  lat: number,
  lon: number,
  rad: number = ORB_R
) {
  const group = new THREE.Group();
  const mats: OrbMat[] = [];
  const seg = 64;

  const add = (pts: THREE.Vector3[], c: string, base: number) => {
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: c,
      transparent: true,
      opacity: base,
      blending: THREE.AdditiveBlending,
    });
    mats.push({ mat, base });
    group.add(new THREE.LineLoop(geo, mat));
  };

  // Longitude threads
  for (let j = 0; j < lon; j++) {
    const phi = (j * Math.PI) / lon;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < seg; k++) {
      const th = (k / seg) * TAU;
      const x = rad * Math.cos(th);
      pts.push(
        new THREE.Vector3(x * Math.cos(phi), rad * Math.sin(th), x * Math.sin(phi))
      );
    }
    add(pts, second, 0.8);
  }

  // Latitude threads
  for (let i = 1; i <= lat; i++) {
    const a = (i * Math.PI) / (lat + 1);
    const y = rad * Math.cos(a);
    const r = rad * Math.sin(a);
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < seg; k++) {
      const th = (k / seg) * TAU;
      pts.push(new THREE.Vector3(r * Math.cos(th), y, r * Math.sin(th)));
    }
    add(pts, color, 0.9);
  }

  return { group, mats };
}

function OrbitThread({ radius, dim }: { radius: number; dim: boolean }) {
  const lines = useMemo(() => {
    const n = Math.round(radius * 10) * 2;
    const seg = n * 8;
    const make = (sign: number, color: string) => {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k < seg; k++) {
        const a = (k / seg) * TAU;
        pts.push(
          new THREE.Vector3(
            Math.cos(a) * radius,
            Math.sin(a) * radius,
            0.45 + sign * 0.05 * Math.cos(n * a)
          )
        );
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });
      return new THREE.LineLoop(geo, mat);
    };
    return [make(1, "#FFB84A"), make(-1, "#2EE6A6")];
  }, [radius]);

  useFrame(() => {
    for (const l of lines) {
      const m = l.material as THREE.LineBasicMaterial;
      m.opacity = lerp(m.opacity, dim ? 0.05 : 0.4, 0.1);
    }
  });

  return (
    <>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </>
  );
}

function Sun() {
  const body = useRef<THREE.Group>(null!);
  const orb = useRef<THREE.Group>(null!);
  const coreA = useRef<THREE.Mesh>(null!);
  const coreB = useRef<THREE.Mesh>(null!);
  const caption = useRef<HTMLDivElement>(null);
  const camera = useThree((s) => s.camera);
  const dimmed = useGame((s) => s.category) !== null;
  const orbData = useMemo(
    () => buildOrb("#FFB84A", "#2EE6A6", 6, 10, SUN_R),
    []
  );

  useFrame((state, delta) => {
    const k = orbSize(state.viewport.width);
    body.current.scale.setScalar(k / weaveScale.v);
    orb.current.rotation.y += delta * 0.25;
    orb.current.rotation.x = 0.35;

    if (caption.current) {
      const pxPerUnit =
        state.size.height /
        (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(22.5)));
      const px = SUN_R * 1.2 * k * pxPerUnit + 24;
      caption.current.style.transform = `translateY(${px}px)`;
    }

    for (const m of orbData.mats) {
      m.mat.opacity = lerp(m.mat.opacity, dimmed ? 0.1 : m.base, 0.1);
    }
    for (const r of [coreA, coreB]) {
      const mat = r.current.material as THREE.MeshBasicMaterial;
      mat.opacity = lerp(mat.opacity, dimmed ? 0.12 : 1, 0.1);
    }
  });

  return (
    <group position={[0, 0, 0.45]}>
      <group ref={body}>
        <group ref={orb}>
          <primitive object={orbData.group} />
          <mesh ref={coreA}>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshBasicMaterial
              color="#FFB84A"
              toneMapped={false}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh ref={coreB}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshBasicMaterial
              color="#ffffff"
              toneMapped={false}
              transparent
              opacity={1}
            />
          </mesh>
        </group>
        <Html
          center
          position={[0, 0, 0]}
          zIndexRange={[5, 0]}
          pointerEvents="none"
        >
          <div
            ref={caption}
            style={{ opacity: dimmed ? 0 : 1, transition: "opacity .3s" }}
          >
            <div
              className="whitespace-nowrap border px-3 py-1.5 text-center font-mono text-xs"
              style={{
                color: "#FFB84A",
                borderColor: "#FFB84A",
                background: "rgba(5,8,13,.85)",
              }}
            >
              WU
              <span className="block text-[10px] opacity-70">PLAYER ONE</span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

function SkillKnot({
  skill,
  x,
  y,
  color,
}: {
  skill: Skill;
  x: number;
  y: number;
  color: string;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const hovered = useRef(false);
  const select = useGame((s) => s.select);
  const setHoverLabel = useGame((s) => s.setHoverLabel);
  const done = useGame((s) => s.achievements.includes(`skill-${skill.id}`));
  const active = useGame((s) => s.selected === skill.id);

  useEffect(() => () => setHoverLabel(null), [setHoverLabel]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const target = active
      ? 1.7
      : hovered.current
        ? 1.5
        : done
          ? 1
          : 1 + Math.sin(t * 2.4 + x) * 0.25;
    mesh.current.scale.setScalar(lerp(mesh.current.scale.x, target, 0.15));
  });

  return (
    <group position={[x, y, 0]}>
      <mesh ref={mesh}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          transparent
          opacity={done ? 1 : 0.75}
        />
      </mesh>

      {/* Bigger invisible click area */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          setHoverLabel("OPEN");
        }}
        onPointerOut={() => {
          hovered.current = false;
          setHoverLabel(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          select(skill.id);
        }}
      >
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Label sits at a fixed pixel distance below the knot */}
      <Html
        center
        position={[0, 0, 0]}
        zIndexRange={[5, 0]}
        pointerEvents="none"
      >
        <div style={{ transform: "translateY(30px)" }}>
          <button
            aria-label={`Open ${skill.name}`}
            onClick={() => select(skill.id)}
            className="whitespace-nowrap border px-2 py-1 font-mono text-[11px] focus-visible:outline-2 focus-visible:outline-white"
            style={{
              color,
              borderColor: color,
              background: done ? `${color}22` : "rgba(5,8,13,.8)",
            }}
          >
            {skill.name}
          </button>
        </div>
      </Html>
    </group>
  );
}

function CategoryNode({ cat, index }: { cat: Category; index: number }) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const orb = useRef<THREE.Group>(null!);
  const coreA = useRef<THREE.Mesh>(null!);
  const coreB = useRef<THREE.Mesh>(null!);
  const sparks = useRef<(THREE.Mesh | null)[]>([]);
  const fan = useRef<THREE.Group>(null);
  const caption = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const angle = useRef(cat.phase);
  const mul = useRef(1);
  const reduce = useRef(false);
  const camera = useThree((s) => s.camera);
  const tmp = useMemo(
    () => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }),
    []
  );

  const openId = useGame((s) => s.category);
  const openCategory = useGame((s) => s.openCategory);
  const setHoverLabel = useGame((s) => s.setHoverLabel);
  const tied = useGame(
    (s) => cat.skills.filter((k) => s.achievements.includes(`skill-${k.id}`)).length
  );

  const isOpen = openId === cat.id;
  const dimmed = openId !== null && !isOpen;
  const actionable = !isOpen && !dimmed;
  const total = cat.skills.length;

  // Each orb gets a slightly different thread density
  const dens = index % 3;
  const orbData = useMemo(
    () => buildOrb(cat.color, secondColor(cat.color), 4 + dens, 6 + dens * 2),
    [cat.color, dens]
  );

  const spots = useMemo(
    () =>
      cat.skills.map((skill, i) => {
        const a = (i / cat.skills.length) * TAU - Math.PI / 2;
        return {
          skill,
          x: Math.cos(a) * RING_RADIUS,
          y: Math.sin(a) * RING_RADIUS,
        };
      }),
    [cat]
  );

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    hovered.current = false;
    setHoverLabel(null);
  }, [isOpen, dimmed, setHoverLabel]);

  useEffect(() => () => setHoverLabel(null), [setHoverLabel]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const h = hovered.current;
    const k = orbSize(state.viewport.width);

    // Orbit: slow to a stop on hover or while a category is open
    const still = openId !== null || h || reduce.current;
    mul.current += ((still ? 0 : 1) - mul.current) * 0.08;
    if (still && mul.current < 0.01) mul.current = 0;
    angle.current += delta * cat.speed * mul.current;
    const ox = Math.cos(angle.current) * cat.orbit;
    const oy = Math.sin(angle.current) * cat.orbit;
    root.current.position.set(ox, oy, 0.45);
    orbPos[cat.id] = { x: ox, y: oy };

    // Cancel perspective and weave scale so every orb looks the same size
    root.current.getWorldPosition(tmp.a);
    root.current.parent!.getWorldPosition(tmp.b);
    const comp =
      camera.position.distanceTo(tmp.a) / camera.position.distanceTo(tmp.b);
    body.current.scale.setScalar((comp * k) / weaveScale.v);

    // Caption: fixed pixel gap under the orb, same for every orb
    if (caption.current) {
      const pxPerUnit =
        state.size.height /
        (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(22.5)));
      const px = ORB_R * 1.25 * k * pxPerUnit + 26;
      caption.current.style.transform = `translateY(${px}px)`;
    }

    const target = isOpen
      ? 1.25
      : h
        ? 1.18
        : 1 + Math.sin(t * 1.8 + index * 1.7) * 0.05;
    orb.current.scale.setScalar(lerp(orb.current.scale.x, target, 0.12));
    orb.current.rotation.y += delta * (h ? 1.3 : 0.4);
    orb.current.rotation.x = 0.35;

    for (const m of orbData.mats) {
      const goal = dimmed ? 0.1 : h ? 1 : m.base;
      m.mat.opacity = lerp(m.mat.opacity, goal, 0.1);
    }
    for (const r of [coreA, coreB]) {
      const mat = r.current.material as THREE.MeshBasicMaterial;
      mat.opacity = lerp(mat.opacity, dimmed ? 0.12 : 1, 0.1);
    }

    sparks.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.visible = !dimmed;
      const a = t * (0.9 + i * 0.25) + i * 2.1;
      mesh.position.set(Math.cos(a) * 1.0, Math.sin(a) * 0.3, 0);
    });

    if (fan.current) {
      fan.current.scale.setScalar(lerp(fan.current.scale.x, 1, 0.08));
    }
  });

  return (
    <group ref={root}>
      <group ref={body}>
        <group ref={orb}>
          <primitive object={orbData.group} />
          <mesh ref={coreA}>
            <sphereGeometry args={[0.17, 24, 24]} />
            <meshBasicMaterial
              color={cat.color}
              toneMapped={false}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh ref={coreB}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial
              color="#ffffff"
              toneMapped={false}
              transparent
              opacity={1}
            />
          </mesh>
        </group>

        {/* Sparks orbiting the orb */}
        <group rotation={[0, 0, -0.35]}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              ref={(m) => {
                sparks.current[i] = m;
              }}
            >
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial
                color={i === 1 ? secondColor(cat.color) : cat.color}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>

        {/* The whole orb is the click target */}
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            if (!actionable) return;
            hovered.current = true;
            setHoverLabel("ENTER");
          }}
          onPointerOut={() => {
            hovered.current = false;
            setHoverLabel(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (actionable) openCategory(cat.id);
          }}
        >
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Caption attached to the orb centre, offset in pixels */}
        <Html
          center
          position={[0, 0, 0]}
          zIndexRange={[5, 0]}
          pointerEvents="none"
        >
          <div ref={caption}>
            <button
              aria-label={`Open ${cat.name}`}
              disabled={!actionable}
              onClick={() => openCategory(cat.id)}
              className="whitespace-nowrap border px-3 py-1.5 text-center font-mono text-xs focus-visible:outline-2 focus-visible:outline-white"
              style={{
                color: cat.color,
                borderColor: cat.color,
                background: "rgba(5,8,13,.85)",
                opacity: dimmed ? 0.25 : 1,
              }}
            >
              {cat.name.toUpperCase()}
              <span className="block text-[10px] opacity-70">
                {tied}/{total} tied
              </span>
            </button>
          </div>
        </Html>
      </group>

      {isOpen && (
        <group ref={fan} scale={0.001}>
          {spots.map((p) => (
            <Line
              key={`line-${p.skill.id}`}
              points={[
                [0, 0, 0],
                [p.x, p.y, 0],
              ]}
              color={cat.color}
              lineWidth={1}
              transparent
              opacity={0.5}
            />
          ))}
          {spots.map((p) => (
            <SkillKnot
              key={p.skill.id}
              skill={p.skill}
              x={p.x}
              y={p.y}
              color={cat.color}
            />
          ))}
        </group>
      )}
    </group>
  );
}

function Weave() {
  const group = useRef<THREE.Group>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const camera = useThree((s) => s.camera);
  const viewport = useThree((s) => s.viewport);
  const wide = viewport.width > 10;
  const inSkills = useGame((s) => s.section) === "skills";
  const openId = useGame((s) => s.category);
  const cat = CATEGORIES.find((c) => c.id === openId) ?? null;

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

    const zoomed = inSkills && cat !== null;
    const fit = Math.max(
      0.2,
      Math.min(
        1.05,
        viewport.width / (2 * OUTER + 2),
        (viewport.height / 2 - 1.0) / (OUTER * Math.cos(TILT))
      )
    );
    const zoomScale = Math.max(
      0.3,
      Math.min(
        1.6,
        viewport.width / 6,
        (viewport.height / 2 - 0.7) / (RING_RADIUS * Math.cos(TILT))
      )
    );
    const targetScale = zoomed ? zoomScale : inSkills ? fit : wide ? 1 : 0.7;

    // When a category is open, centre the orb where it stopped
    const p = cat ? orbPos[cat.id] ?? { x: 0, y: 0 } : { x: 0, y: 0 };
    const targetX = zoomed
      ? -p.x * targetScale
      : inSkills
        ? 0
        : wide
          ? 3.2
          : 0;
    const targetY = zoomed
      ? -(p.y * Math.cos(TILT) + 0.45 * Math.sin(TILT)) * targetScale
      : 0;
    const tiltX = inSkills ? -TILT + m.y * 0.1 : -1 + m.y * 0.15;

    g.position.x = lerp(g.position.x, targetX, 0.06);
    g.position.y = lerp(g.position.y, targetY, 0.06);
    g.scale.setScalar(lerp(g.scale.x, targetScale, 0.06));
    weaveScale.v = g.scale.x;
    g.rotation.x = lerp(g.rotation.x, tiltX, 0.05);
    g.rotation.y = lerp(g.rotation.y, m.x * (inSkills ? 0.1 : 0.2), 0.05);

    if (inSkills) {
      let z = g.rotation.z % TAU;
      if (z > Math.PI) z -= TAU;
      if (z < -Math.PI) z += TAU;
      g.rotation.z = lerp(z, 0, 0.06);
    } else {
      g.rotation.z += delta * 0.04;
    }

    g.updateMatrixWorld();
    tools.n.set(0, 0, 1).transformDirection(g.matrixWorld);
    g.getWorldPosition(tools.p);
    tools.plane.setFromNormalAndCoplanarPoint(tools.n, tools.p);
    tools.ndc.set(m.x, m.y);
    tools.ray.setFromCamera(tools.ndc, camera);
    const has = tools.ray.ray.intersectPlane(tools.plane, tools.hit) !== null;
    if (has) g.worldToLocal(tools.hit);

    for (const line of threads) {
      // The lattice dims in the skills view so the orbits stay readable
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = lerp(mat.opacity, inSkills ? 0.3 : 0.85, 0.06);

      const pos = line.geometry.attributes.position as THREE.BufferAttribute;
      const baseArr = line.geometry.userData.base as Float32Array;
      for (let k = 0; k < pos.count; k++) {
        const bx = baseArr[k * 3];
        const by = baseArr[k * 3 + 1];
        const bz = baseArr[k * 3 + 2];
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
      {inSkills && (
        <>
          <Sun />
          {CATEGORIES.map((c) => (
            <OrbitThread key={c.id} radius={c.orbit} dim={openId !== null} />
          ))}
          {CATEGORIES.map((c, i) => (
            <CategoryNode key={c.id} cat={c} index={i} />
          ))}
        </>
      )}
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 9], fov: 45 }}
      onPointerMissed={() => {
        const { category, openCategory } = useGame.getState();
        if (category) openCategory(null);
      }}
    >
      <color attach="background" args={["#05080d"]} />
      <Weave />
      <EffectComposer>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.15} />
      </EffectComposer>
    </Canvas>
  );
}