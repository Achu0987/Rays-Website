"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  Scene,
  Vector2,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const NIGHT = new Color("#0a0807");

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function seeded(seed) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Backdrop: a warm umber room, an amber glow low on the left ---------- */

function Backdrop() {
  const material = useMemo(
    () => ({
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          float amber = pow(max(0.0, dot(vDir, normalize(vec3(-0.6, -0.45, -0.6)))), 2.2);
          float top = pow(max(0.0, dot(vDir, normalize(vec3(0.0, 0.9, -0.4)))), 6.0);
          vec3 col = vec3(0.024, 0.018, 0.016) + vec3(0.2, 0.075, 0.025) * pow(amber, 1.6) + vec3(0.07, 0.035, 0.018) * top;
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }
      `,
      side: BackSide,
      depthWrite: false,
    }),
    [],
  );
  const mesh = useRef();
  useFrame(({ camera }) => {
    mesh.current.position.copy(camera.position);
  });
  return (
    <mesh ref={mesh} renderOrder={-1}>
      <sphereGeometry args={[90, 32, 32]} />
      <shaderMaterial args={[material]} />
    </mesh>
  );
}

/* ---------- Particles: soap-bubble rings with rainbow rims, and fine bokeh dust ---------- */

const PALETTE = ["#7ce8dc", "#e7c46a", "#8b6cf0", "#f2ead9", "#5fb6ff", "#ff8fb1"].map((c) => new Color(c));

function Particles({ count, bubbles }) {
  const geometry = useMemo(() => {
    const random = seeded(7);
    const total = count + bubbles;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const size = new Float32Array(total);
    const phase = new Float32Array(total);
    const kind = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const isBubble = i >= count;
      // Bubbles cluster in a band around the action; dust fills the whole volume.
      const spread = isBubble ? [14, 7, 10] : [26, 16, 22];
      pos.set([(random() - 0.5) * spread[0], (random() - 0.5) * spread[1], 2 - random() * spread[2]], i * 3);
      const c = PALETTE[Math.floor(random() * PALETTE.length)];
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = isBubble ? 1.6 + Math.pow(random(), 2) * 4.5 : 0.35 + Math.pow(random(), 3) * 2.2;
      phase[i] = random() * 6.28;
      kind[i] = isBubble ? 1 : 0;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("color", new BufferAttribute(col, 3));
    g.setAttribute("aSize", new BufferAttribute(size, 1));
    g.setAttribute("aPhase", new BufferAttribute(phase, 1));
    g.setAttribute("aKind", new BufferAttribute(kind, 1));
    return g;
  }, [count, bubbles]);
  const material = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 }, uPixel: { value: 1 }, uFade: { value: 0.25 } },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aPhase;
        attribute float aKind;
        uniform float uTime;
        uniform float uPixel;
        varying vec3 vColor;
        varying float vKind;
        varying float vTwinkle;
        varying float vPhase;
        void main() {
          vColor = color;
          vKind = aKind;
          vPhase = aPhase;
          vec3 p = position;
          p.y += sin(uTime * 0.25 + aPhase) * 0.3 + aKind * mod(uTime * 0.05 + aPhase, 1.0) * 0.6;
          p.x += cos(uTime * 0.18 + aPhase) * 0.22;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vTwinkle = 0.6 + 0.4 * sin(uTime * 1.2 + aPhase * 3.0);
          gl_PointSize = aSize * uPixel * (34.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uFade;
        varying vec3 vColor;
        varying float vKind;
        varying float vTwinkle;
        varying float vPhase;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          vec3 col;
          float a;
          if (vKind > 0.5) {
            // Soap bubble: a thin bright rim, rainbow round its edge, a glint, almost clear inside.
            float rim = smoothstep(0.36, 0.47, d) * smoothstep(0.5, 0.46, d);
            float ang = atan(c.y, c.x) + vPhase;
            vec3 film = 0.55 + 0.45 * cos(ang * 2.0 + vec3(0.0, 2.1, 4.2));
            float glint = smoothstep(0.12, 0.0, length(c - vec2(-0.16, 0.18)));
            col = film * rim * 1.1 + vec3(1.0) * glint * 0.8 + vColor * 0.05;
            a = rim * 0.9 + glint * 0.6 + 0.04;
          } else {
            a = smoothstep(0.5, 0.0, d);
            a *= a;
            col = vColor * a;
          }
          gl_FragColor = vec4(col * vTwinkle * uFade, a * vTwinkle * uFade);
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
    [],
  );
  const gl = useThree((s) => s.gl);
  const points = useRef();
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock, pointer }) => {
    const u = points.current.material.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uPixel.value = gl.getPixelRatio();
    points.current.rotation.y = pointer.x * 0.05;
    points.current.rotation.x = -pointer.y * 0.03;
  });
  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial args={[material]} />
    </points>
  );
}

/* ---------- The compass: a real, photoscanned brass compass that carries the warm section ---------- */

const COMPASS_URL = "/assets/models/seadogs_compass/seadogs_compass.gltf";
const LID_OPEN = -2.09; // the scan's own open angle (120°)

function Compass({ world, mobile }) {
  const gltf = useLoader(GLTFLoader, COMPASS_URL);
  const holder = useRef();
  const needleAim = useRef(0);
  const { root, lid, needle, needleBase, scale } = useMemo(() => {
    const r = gltf.scene;
    let lidNode = null;
    let needleNode = null;
    r.traverse((o) => {
      if (o.name === "seadogs_compass_lid") lidNode = o;
      if (o.name === "seadogs_compass_needle") needleNode = o;
      if (o.isMesh) o.material.envMapIntensity = 1.8;
    });
    return { root: r, lid: lidNode, needle: needleNode, needleBase: needleNode?.rotation.y ?? 0, scale: (mobile ? 1.9 : 2.7) / 0.085 };
  }, [gltf, mobile]);

  useFrame(({ clock, pointer }, delta) => {
    const b = world.current.compass; // 0..1 across the whole warm section
    const t = clock.elapsedTime;
    const h = holder.current;
    const appear = smooth(0.0, 0.035, b);
    const open = smooth(0.2, 0.38, b);
    const close = smooth(0.38, 0.5, b); // steps back as the ghost word arrives
    const aside = smooth(0.5, 0.6, b);
    // Leaves before the pillar cards arrive.
    world.current.away = (world.current.away ?? 0) + ((world.current.cardsNear ? 1 : 0) - (world.current.away ?? 0)) * Math.min(1, delta * 4);
    const gone = Math.max(smooth(0.55, 0.62, b), world.current.away);
    h.visible = appear > 0.001 && gone < 0.999;

    // Face the visitor, then turn to three-quarters as the lid opens, then step aside for the cards.
    const s = scale * (1 + open * 0.35 - close * 0.55 - aside * 0.1) * (1 - gone);
    h.scale.setScalar(s);
    h.position.set(
      aside * (mobile ? 0 : -4.1),
      -7 * (1 - appear) - 0.55 + open * 0.25 + close * 0.2 + aside * (mobile ? 2.2 : 0.4) + Math.sin(t * 0.7) * 0.05,
      open * 0.8 - close * 0.8,
    );
    h.rotation.x = 1.32 - open * 0.55 + close * 0.3 + pointer.y * 0.12;
    h.rotation.y = -open * 0.6 + close * 0.6 + aside * t * 0.25 + pointer.x * 0.2;
    h.rotation.z = Math.sin(t * 0.4) * 0.05;

    if (lid) lid.rotation.x = -0.12 + (LID_OPEN + 0.12) * open;
    // The needle swings to point at the cursor, with a little overshoot like a real compass.
    if (needle) {
      const target = needleBase + Math.atan2(pointer.x, pointer.y);
      needleAim.current += (target - needleAim.current) * Math.min(1, delta * 2.5);
      needle.rotation.y = needleAim.current + Math.sin(t * 3) * 0.02;
    }
  });

  return (
    <group ref={holder}>
      <primitive object={root} />
    </group>
  );
}

/* ---------- Film finish: bloom, chromatic aberration that follows scroll speed, grain ---------- */

const filmShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uShift: { value: 0 }, uRes: { value: new Vector2(1, 1) } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uShift;
    uniform vec2 uRes;
    varying vec2 vUv;
    float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    void main() {
      vec2 c = vUv - 0.5;
      float edge = dot(c, c);
      vec2 off = c * (0.003 + uShift) * (0.4 + edge * 2.5);
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;
      col *= 1.0 - smoothstep(0.12, 0.7, edge) * 0.7;
      col += (hash(vUv * uRes + fract(uTime) * 97.0) - 0.5) * 0.028;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

function Film({ world }) {
  const { gl, scene, camera, size } = useThree();
  const { composer, film } = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new Vector2(size.width, size.height), 0.38, 0.5, 0.94));
    const f = new ShaderPass(filmShader);
    c.addPass(f);
    c.addPass(new OutputPass());
    return { composer: c, film: f };
  }, [gl, scene, camera, size.width, size.height]);
  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
    return () => composer.dispose();
  }, [composer, gl, size]);
  useFrame(({ clock }) => {
    film.uniforms.uTime.value = clock.elapsedTime;
    film.uniforms.uShift.value = Math.min(0.02, Math.abs(world.current.velocity) * 0.6);
    film.uniforms.uRes.value.set(size.width, size.height);
    composer.render();
  }, 1);
  return null;
}

/* ---------- Camera: a steady view of the compass, nudged by the cursor ---------- */

function Rig({ world, mobile }) {
  const look = useMemo(() => new Vector3(), []);
  useFrame(({ camera, pointer }, delta) => {
    const w = world.current;
    const before = w.compass;
    w.compass += (w.compassTarget - w.compass) * Math.min(1, delta * 4);
    w.velocity = (w.compass - before) / Math.max(delta, 1e-3) / 60;
    camera.position.set(pointer.x * 0.4, (mobile ? 0.6 : 0.2) + pointer.y * 0.25, mobile ? 9 : 7.2);
    look.set(0, 0, 0);
    camera.lookAt(look);
  });
  return null;
}

/** A dark studio lit by a few coloured strips: what the chrome reflects. */
function studio() {
  const room = new Scene();
  room.background = new Color("#010203");
  const strip = (color, intensity, pos, size, rotY = 0) => {
    const m = new Mesh(new BoxGeometry(...size), new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity) }));
    m.position.set(...pos);
    m.rotation.y = rotY;
    room.add(m);
  };
  strip("#7ce8dc", 6, [-5, 3, -2], [0.4, 6, 3], 0.6);
  strip("#a77cff", 5, [5, 1, -1], [0.4, 5, 3], -0.6);
  strip("#ffe3bd", 8, [0, 6, 2], [6, 0.3, 1.2]);
  strip("#ff8fb1", 3, [-3, -4, 3], [3, 0.3, 1]);
  strip("#ffffff", 3, [2, 2, 6], [1.2, 1.2, 0.2]);
  return room;
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(studio(), 0.02).texture;
    scene.environment = env;
    scene.background = NIGHT;
    return () => {
      env.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

export default function WorldScene({ world, mobile }) {
  return (
    <Canvas
      className="world-canvas"
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: mobile ? 58 : 40, near: 0.1, far: 200, position: [0, 0, 8] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Environment />
      <Rig world={world} mobile={mobile} />
      <Backdrop />
      <Suspense fallback={null}>
        <Compass world={world} mobile={mobile} />
      </Suspense>
      <Particles count={mobile ? 600 : 1500} bubbles={mobile ? 90 : 220} />
      <pointLight position={[3, 3, 4]} intensity={26} color="#7ce8dc" />
      <pointLight position={[-4, -2, 2]} intensity={20} color="#a77cff" />
      {!mobile && <Film world={world} />}
    </Canvas>
  );
}
