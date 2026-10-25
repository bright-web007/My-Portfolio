"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Html } from "@react-three/drei";
import { useGame } from "@/store/useGame";
import { CATEGORIES, type Category, type Skill } from "@/lib/Skills";

const N = 24;
const S = 0.5;
const SEG = N * 10;
const AMP = 0.16;
const TAU = Math.PI * 2;
const TILT = 0.75;
const RING_RADIUS = 1.2;
const skillRingRadius = (viewportWidth: number) =>
  viewportWidth > 10 ? RING_RADIUS : 4;
const ORB_R = 0.55;
const SUN_R = 0.6;
const ORBIT_SPEED = 0.09;

// Orbit distance depends only on position in the list
const orbitRadius = (i: number) => 2.2 + i * 0.95;
const OUTER = orbitRadius(CATEGORIES.length - 1);

const lerp = THREE.MathUtils.lerp;
const secondColor = (c: string) => (c === "#FFB84A" ? "#2EE6A6" : "#FFB84A");

// Shared between components, updated every frame
const weaveScale = { v: 1 };
const orbPos: Record<string, { x: number; y: number }> = {};
// One shared orbit clock keeps the orbs evenly spaced at all times
const orbit: { angle: number; mul: number; hovered: string | null } = {
  angle: 0,
  mul: 1,
  hovered: null,
};
const zoomFocus = { ready: false };

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
      </group>
    </group>
  );
}

function SkillKnot({
  skill,
  x,
  y,
  color,
  activeCategory,
}: {
  skill: Skill;
  x: number;
  y: number;
  color: string;
  activeCategory: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const clickArea = useRef<HTMLButtonElement>(null);
  const label = useRef<HTMLButtonElement>(null);
  const hovered = useRef(false);
  const select = useGame((s) => s.select);
  const done = useGame((s) => s.achievements.includes(`skill-${skill.id}`));
  const active = useGame((s) => s.selected === skill.id);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const visible = activeCategory && zoomFocus.ready;
    for (const button of [clickArea.current, label.current]) {
      if (!button) continue;
      button.style.opacity = visible ? "1" : "0";
      button.style.pointerEvents = visible ? "auto" : "none";
    }
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

      {/* Click area and label are HTML, anchored to the knot */}
      <Html
        center
        position={[0, 0, 0]}
        zIndexRange={[5, 0]}
        wrapperClass="pointer-events-none"
      >
        <div className="pointer-events-none relative h-0 w-0">
          <button
            ref={clickArea}
            aria-hidden="true"
            tabIndex={-1}
            data-cursor="LEARN"
            onClick={() => select(skill.id)}
            onPointerEnter={() => {
              hovered.current = true;
            }}
            onPointerLeave={() => {
              hovered.current = false;
            }}
            className="absolute rounded-full"
            style={{
              left: 0,
              top: 0,
              width: 44,
              height: 44,
              transform: "translate(-50%, -50%)",
              opacity: 0,
              pointerEvents: "none",
            }}
          />
          <button
            ref={label}
            aria-label={`Open ${skill.name}`}
            aria-hidden={!activeCategory}
            tabIndex={activeCategory ? 0 : -1}
            data-cursor="LEARN"
            onClick={() => select(skill.id)}
            onPointerEnter={() => {
              hovered.current = true;
            }}
            onPointerLeave={() => {
              hovered.current = false;
            }}
            className="absolute whitespace-nowrap border px-2 py-1 font-mono text-[11px] focus-visible:outline-2 focus-visible:outline-white"
            style={{
              left: 0,
              top: 0,
              marginTop: 24,
              transform: "translateX(-50%)",
              color,
              borderColor: color,
              background: "rgba(5,8,13,.96)",
              opacity: 0,
              pointerEvents: "none",
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
  const haloA = useRef<THREE.Mesh>(null!);
  const haloB = useRef<THREE.Mesh>(null!);
  const selRing = useRef<THREE.Mesh>(null!);
  const sparks = useRef<(THREE.Mesh | null)[]>([]);
  const fan = useRef<THREE.Group>(null);
  const box = useRef<HTMLButtonElement>(null);
  const hovered = useRef(false);
  const camera = useThree((s) => s.camera);
  const viewport = useThree((s) => s.viewport);
  const ringRadius = skillRingRadius(viewport.width);
  const tmp = useMemo(
    () => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }),
    []
  );

  const openId = useGame((s) => s.category);
  const openCategory = useGame((s) => s.openCategory);

  const isOpen = openId === cat.id;
  const dimmed = openId !== null && !isOpen;
  const actionable = !isOpen && !dimmed;
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
          x: Math.cos(a) * ringRadius,
          y: Math.sin(a) * ringRadius,
        };
      }),
    [cat, ringRadius]
  );

  useEffect(() => {
    hovered.current = false;
    if (orbit.hovered === cat.id) orbit.hovered = null;
  }, [isOpen, dimmed, cat.id]);

  useEffect(
    () => () => {
      if (orbit.hovered === cat.id) orbit.hovered = null;
    },
    [cat.id]
  );

  // Hovering (or pressing) freezes the whole orbit at once, so the orb
  // can never slide out from under the cursor before the click lands
  const enter = () => {
    if (!actionable) return;
    hovered.current = true;
    orbit.hovered = cat.id;
    orbit.mul = 0;
  };
  const leave = () => {
    hovered.current = false;
    if (orbit.hovered === cat.id) orbit.hovered = null;
  };
  const toggleCategory = () => {
    const nextCategory = actionable ? cat.id : null;
    requestAnimationFrame(() => openCategory(nextCategory));
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const h = hovered.current;
    const k = orbSize(state.viewport.width);

    // Position on the shared orbit: evenly spaced, so orbs never bunch up
    const a = orbit.angle + (index / CATEGORIES.length) * TAU + 0.6;
    const r = orbitRadius(index);
    const ox = Math.cos(a) * r;
    const oy = Math.sin(a) * r;
    root.current.position.set(ox, oy, 0.45);
    orbPos[cat.id] = { x: ox, y: oy };

    // Cancel perspective and weave scale so every orb looks the same size
    root.current.getWorldPosition(tmp.a);
    root.current.parent!.getWorldPosition(tmp.b);
    const comp =
      camera.position.distanceTo(tmp.a) / camera.position.distanceTo(tmp.b);
    const focusZoom = isOpen ? 1.5 : 1;
    body.current.scale.setScalar((comp * k * focusZoom) / weaveScale.v);

    // On-screen orb radius in pixels, same for every orb
    const pxPerUnit =
      state.size.height /
      (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(22.5)));
    const rPx = ORB_R * k * pxPerUnit;

    // Keep the click area and name centered on the orb
    const d = Math.round(rPx * 2.6);
    if (box.current) {
      box.current.style.width = `${d}px`;
      box.current.style.height = `${d}px`;
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
    for (const rr of [coreA, coreB]) {
      const mat = rr.current.material as THREE.MeshBasicMaterial;
      mat.opacity = lerp(mat.opacity, dimmed ? 0.12 : 1, 0.1);
    }

    // Hover glow: halo, spinning ring and a brighter core
    const glow = dimmed ? 0 : h ? 1 : 0.15 + Math.sin(t * 1.8 + index) * 0.05;
    const ma = haloA.current.material as THREE.MeshBasicMaterial;
    const mb = haloB.current.material as THREE.MeshBasicMaterial;
    const mr = selRing.current.material as THREE.MeshBasicMaterial;
    ma.opacity = lerp(ma.opacity, glow * 0.22, 0.12);
    mb.opacity = lerp(mb.opacity, glow * 0.1, 0.12);
    mr.opacity = lerp(mr.opacity, h ? 0.9 : 0, 0.12);
    selRing.current.rotation.z += delta * 1.2;
    coreA.current.scale.setScalar(
      lerp(coreA.current.scale.x, h ? 1.6 : 1, 0.15)
    );

    sparks.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.visible = !dimmed;
      const sa = t * (0.9 + i * 0.25) + i * 2.1;
      mesh.position.set(Math.cos(sa) * 1.0, Math.sin(sa) * 0.3, 0);
    });

    if (fan.current) {
      const target = isOpen && zoomFocus.ready ? 1 : 0.001;
      fan.current.scale.setScalar(
        lerp(fan.current.scale.x, target, zoomFocus.ready ? 0.18 : 0.2)
      );
      if (isOpen && zoomFocus.ready) {
        fan.current.rotation.z += delta * 0.4;
      }
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
          <mesh ref={haloA}>
            <sphereGeometry args={[0.8, 24, 24]} />
            <meshBasicMaterial
              color={cat.color}
              toneMapped={false}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh ref={haloB}>
            <sphereGeometry args={[1.05, 24, 24]} />
            <meshBasicMaterial
              color={cat.color}
              toneMapped={false}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh ref={selRing}>
            <torusGeometry args={[0.95, 0.012, 8, 72]} />
            <meshBasicMaterial
              color={cat.color}
              toneMapped={false}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
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

        {/* Keep the category name centered inside the orb's click area */}
        <Html
          center
          position={[0, 0, 0]}
          zIndexRange={[5, 0]}
          wrapperClass="pointer-events-none"
        >
          <div className="pointer-events-none relative h-0 w-0">
            <button
              ref={box}
              aria-label={actionable ? `Open ${cat.name}` : "Close"}
              data-cursor={actionable ? "EXPLORE" : "CLOSE"}
              onClick={toggleCategory}
              onPointerEnter={enter}
              onPointerDown={enter}
              onPointerLeave={leave}
              className="group absolute left-0 top-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-white"
              style={{
                width: 80,
                height: 80,
                transform: "translate(-50%, -50%)",
                pointerEvents: isOpen ? "none" : "auto",
              }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 block rounded-full"
              />
              <span
                className="absolute left-1/2 top-1/2 z-10 whitespace-nowrap border px-3 py-1.5 text-center font-mono text-xs"
                style={{
                  transform: "translate(-50%, -50%)",
                  color: cat.color,
                  borderColor: cat.color,
                  background: "rgba(5,8,13,.85)",
                  opacity: dimmed ? 0.25 : 1,
                }}
              >
                {cat.name.toUpperCase()}
              </span>
            </button>
          </div>
        </Html>
      </group>

      <group ref={fan} scale={0.001}>
        {spots.map((p) => (
          <SkillKnot
            key={p.skill.id}
            skill={p.skill}
            x={p.x}
            y={p.y}
            color={cat.color}
            activeCategory={isOpen}
          />
        ))}
      </group>
    </group>
  );
}

function Weave() {
  const group = useRef<THREE.Group>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const reduce = useRef(false);
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
    if (inSkills) return [];
    const out: THREE.Line[] = [];
    for (let i = 0; i < N; i++) {
      out.push(makeThread(true, i, "#FFB84A"));
      out.push(makeThread(false, i, "#2EE6A6"));
    }
    return out;
  }, [inSkills]);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    // Shared orbit clock: the whole system pauses on hover or while open
    const open = openId !== null;
    const still = open || orbit.hovered !== null || reduce.current;
    orbit.mul += ((still ? 0 : 1) - orbit.mul) * (open ? 0.25 : 0.08);
    if (still && orbit.mul < 0.01) orbit.mul = 0;
    orbit.angle += delta * ORBIT_SPEED * orbit.mul;

    const zoomed = inSkills && cat !== null;
    const moveEase = zoomed ? 0.12 : 0.06;
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
        1.4,
        viewport.width / (2 * skillRingRadius(viewport.width) + 3.2),
        (viewport.height / 2 - 0.8) /
        (skillRingRadius(viewport.width) * Math.cos(TILT))
      )
    );
    const targetScale = zoomed ? zoomScale : inSkills ? fit : wide ? 1 : 0.7;

    // When a category is open, put its orb exactly in the centre of the page
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

    // Mouse tilt is switched off while zoomed so the centring stays exact
    const mx = zoomed ? 0 : m.x;
    const my = zoomed ? 0 : m.y;
    const tiltX = inSkills ? -TILT + my * 0.1 : -1 + my * 0.15;

    g.position.x = lerp(g.position.x, targetX, moveEase);
    g.position.y = lerp(g.position.y, targetY, moveEase);
    g.scale.setScalar(lerp(g.scale.x, targetScale, moveEase));
    weaveScale.v = g.scale.x;
    g.rotation.x = lerp(g.rotation.x, tiltX, zoomed ? 0.12 : 0.05);
    g.rotation.y = lerp(g.rotation.y, mx * (inSkills ? 0.1 : 0.2), 0.12);
    zoomFocus.ready =
      zoomed &&
      orbit.mul === 0 &&
      Math.abs(g.position.x - targetX) < 0.18 &&
      Math.abs(g.position.y - targetY) < 0.18 &&
      Math.abs(g.scale.x - targetScale) < 0.1 &&
      Math.abs(g.rotation.x - tiltX) < 0.08 &&
      Math.abs(g.rotation.y) < 0.08 &&
      Math.abs(g.rotation.z) < 0.08;

    if (inSkills) {
      let z = g.rotation.z % TAU;
      if (z > Math.PI) z -= TAU;
      if (z < -Math.PI) z += TAU;
      g.rotation.z = lerp(z, 0, 0.06);
    } else {
      g.rotation.z += delta * 0.04;
    }

    if (!inSkills) {
      g.updateMatrixWorld();
      tools.n.set(0, 0, 1).transformDirection(g.matrixWorld);
      g.getWorldPosition(tools.p);
      tools.plane.setFromNormalAndCoplanarPoint(tools.n, tools.p);
      tools.ndc.set(m.x, m.y);
      tools.ray.setFromCamera(tools.ndc, camera);
      const has = tools.ray.ray.intersectPlane(tools.plane, tools.hit) !== null;
      if (has) g.worldToLocal(tools.hit);

      for (const line of threads) {
        const mat = line.material as THREE.LineBasicMaterial;
        mat.opacity = lerp(mat.opacity, 0.85, 0.06);

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
          {CATEGORIES.map((c, i) => (
            <OrbitThread
              key={c.id}
              radius={orbitRadius(i)}
              dim={openId !== null}
            />
          ))}
          {CATEGORIES.map((c, i) => (
            <CategoryNode key={c.id} cat={c} index={i} />
          ))}
        </>
      )}
    </group>
  );
}

export default function Scene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 9], fov: 45 }}
      onPointerMissed={(e) => {
        // Clicks on our HTML buttons are not "empty space" clicks
        const el = e.target as Element | null;
        if (el && typeof el.closest === "function" && el.closest("button")) return;
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