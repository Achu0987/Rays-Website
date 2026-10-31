"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, DoubleSide, Vector3 } from "three";

const BG = new Color("#0a0b0e");
const AMBER = new Color("#d39a4e");
const BONE = new Color("#f2ead9");
const RING = 3; // ring radius, metres

const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** Endless floor: fine dots, ripple circles spreading from the centre, revealed as loading runs. */
function Floor({ state }) {
  const material = useMemo(
    () => ({
      uniforms: {
        uReveal: { value: 0 },
        uLift: { value: 0 },
        uTime: { value: 0 },
        uBg: { value: BG },
        uDot: { value: AMBER },
        uLine: { value: BONE },
      },
      vertexShader: /* glsl */ `
        varying vec2 vP;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vP = w.xz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uReveal;
        uniform float uLift;
        uniform float uTime;
        uniform vec3 uBg;
        uniform vec3 uDot;
        uniform vec3 uLine;
        varying vec2 vP;
        const float RING_IN = ${(RING + 0.4).toFixed(1)};
        const float RING_OUT = ${(RING + 1.2).toFixed(1)};

        void main() {
          float r = length(vP);

          // Dot lattice, anti-aliased with screen-space derivatives.
          vec2 cell = fract(vP * 1.25) - 0.5;
          float d = length(cell);
          float aa = fwidth(d);
          float dots = 1.0 - smoothstep(0.035 - aa, 0.035 + aa, d);

          // Ripple circles every 4 m, drifting slowly outward like thoughts.
          float ring = abs(fract((r - uTime * 0.25) / 4.0) - 0.5) * 4.0;
          float raa = fwidth(r);
          float ripples = (1.0 - smoothstep(0.0, 0.02 + raa, ring)) * smoothstep(RING_IN, RING_OUT, r);

          // Reveal from the centre as loading runs; fade with distance into the dark.
          float shown = 1.0 - smoothstep(uReveal - 2.5, uReveal, r);
          float fade = exp(-r * 0.075);

          vec3 col = uBg;
          col += uDot * dots * 0.55 * fade * shown;
          col += uLine * ripples * 0.07 * fade * shown;
          // Warm pool of light under the ring, stronger once the column rises.
          col += uDot * exp(-r * 0.55) * (0.05 + 0.25 * uLift) * shown;
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }
      `,
    }),
    [],
  );
  const mesh = useRef();
  useFrame((_, delta) => {
    const u = mesh.current.material.uniforms;
    u.uTime.value += delta;
    u.uReveal.value = 3 + ease(state.current.progress) * 60;
    u.uLift.value = state.current.rise;
  });
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[240, 240]} />
      <shaderMaterial args={[material]} />
    </mesh>
  );
}

/** The loading dial: a ring of light with 60 ticks that light up as loading progresses. */
function Dial({ state }) {
  const material = useMemo(
    () => ({
      uniforms: {
        uProgress: { value: 0 },
        uReady: { value: 0 },
        uHover: { value: 0 },
        uFade: { value: 1 },
        uTime: { value: 0 },
        uA: { value: AMBER },
        uB: { value: BONE },
      },
      vertexShader: /* glsl */ `
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uProgress;
        uniform float uReady;
        uniform float uHover;
        uniform float uFade;
        uniform float uTime;
        uniform vec3 uA;
        uniform vec3 uB;
        varying vec2 vP;
        const float R = ${RING.toFixed(1)};
        const float TAU = 6.28318530718;

        void main() {
          float r = length(vP);
          // 0 at twelve o'clock, increasing clockwise as seen from above.
          float a = fract(atan(vP.x, vP.y) / TAU + 1.0);
          float filled = uProgress >= 0.999 ? 1.0 : 1.0 - smoothstep(uProgress - 0.004, uProgress, a);
          float head = exp(-pow((a - uProgress) * 80.0, 2.0)) * step(uProgress, 0.999);

          float aa = fwidth(r);
          float core = 1.0 - smoothstep(0.012, 0.012 + aa * 1.5, abs(r - R));
          float glow = exp(-abs(r - R) * 7.0);
          float halo = exp(-abs(r - R) * 2.2) * 0.25;

          // 60 ticks just inside the ring.
          float tickBand = step(R - 0.42, r) * step(r, R - 0.22);
          float f = fract(a * 60.0);
          float tick = (1.0 - smoothstep(0.05, 0.09, min(f, 1.0 - f))) * tickBand;
          float tickLit = mix(0.09, 1.0, filled);

          float breathe = uReady * (0.5 + 0.5 * sin(uTime * 2.2));
          float strength = (0.85 + 0.35 * breathe + 0.5 * uHover);

          vec3 tone = mix(uA, uB, 0.35 + 0.4 * a);
          vec3 col = vec3(0.0);
          col += tone * (core * 1.4 + glow * 0.55) * (filled + head * 2.0) * strength;
          col += tone * halo * filled * strength;
          col += tone * (core * 0.12 + glow * 0.04) * (1.0 - filled);
          col += uA * tick * tickLit * 0.9 * strength;

          float alpha = clamp(max(max(col.r, col.g), col.b), 0.0, 1.0) * uFade;
          gl_FragColor = vec4(col * uFade, alpha);
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
    [],
  );
  const mesh = useRef();
  useFrame((_, delta) => {
    const s = state.current;
    const u = mesh.current.material.uniforms;
    u.uTime.value += delta;
    u.uProgress.value = s.progress;
    u.uReady.value += ((s.ready ? 1 : 0) - u.uReady.value) * Math.min(1, delta * 3);
    u.uHover.value += ((s.hover ? 1 : 0) - u.uHover.value) * Math.min(1, delta * 6);
    u.uFade.value = 1 - s.rise * 0.6;
  });
  const size = RING * 2 + 3;
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial args={[material]} />
    </mesh>
  );
}

/** A column of light that rises out of the ring when the visitor enters. */
function Column({ state }) {
  const material = useMemo(
    () => ({
      uniforms: { uRise: { value: 0 }, uTime: { value: 0 }, uA: { value: AMBER }, uB: { value: BONE } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying float vEdge;
        void main() {
          vUv = uv;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * normal);
          vEdge = 1.0 - abs(dot(n, normalize(-mv.xyz)));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uRise;
        uniform float uTime;
        uniform vec3 uA;
        uniform vec3 uB;
        varying vec2 vUv;
        varying float vEdge;
        void main() {
          // Light climbs the wall: bright at the floor, thinning towards the leading edge.
          float h = vUv.y;
          float front = smoothstep(uRise, uRise - 0.25, h);
          float fall = pow(1.0 - h, 1.1);
          float shimmer = 0.85 + 0.15 * sin(h * 40.0 - uTime * 6.0);
          float a = front * fall * (0.22 + 0.78 * pow(vEdge, 2.2)) * shimmer;
          vec3 col = mix(uA, uB, 0.3 + h) * a * 2.0;
          gl_FragColor = vec4(col, a);
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
    }),
    [],
  );
  const mesh = useRef();
  useFrame((_, delta) => {
    const u = mesh.current.material.uniforms;
    u.uTime.value += delta;
    u.uRise.value = state.current.rise * 1.25;
    mesh.current.visible = state.current.rise > 0.001;
  });
  return (
    <mesh ref={mesh} position={[0, 14, 0]}>
      <cylinderGeometry args={[RING, RING, 28, 96, 1, true]} />
      <shaderMaterial args={[material]} />
    </mesh>
  );
}

/** Slow drift around the dial; on enter, a flight down towards the column of light. */
function Rig({ state, mobile }) {
  const { camera } = useThree();
  const v = useMemo(() => ({ from: new Vector3(), to: new Vector3(), look: new Vector3() }), []);
  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    const k = ease(state.current.rise * 1.1);
    const orbit = t * 0.05;
    const far = mobile ? 14 : 9.5;
    v.from.set(Math.sin(orbit) * far, mobile ? 10.5 : 7.2, Math.cos(orbit) * far);
    const back = mobile ? 30 : 24;
    v.to.set(Math.sin(orbit) * back, 3.2, Math.cos(orbit) * back);
    camera.position.lerpVectors(v.from, v.to, k);
    camera.position.x += pointer.x * 0.6 * (1 - k);
    camera.position.y += pointer.y * 0.35 * (1 - k);
    v.look.set(0, k * 5.5, 0);
    camera.lookAt(v.look);
  });
  return null;
}

/** Drives loading progress and the entrance from the shared `state` ref owned by Intro. */
function Clock({ state }) {
  useFrame((_, delta) => {
    const s = state.current;
    s.progress += (s.target - s.progress) * Math.min(1, delta * 2.4);
    if (s.target >= 1 && s.progress > 0.995 && !s.ready) {
      s.progress = 1;
      s.ready = true;
      s.onReady?.();
    }
    if (s.entering) s.rise = Math.min(1, s.rise + delta / 2.6);
  });
  return null;
}

export default function IntroScene({ state, mobile }) {
  return (
    <Canvas
      className="intro-canvas"
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: mobile ? 55 : 40, near: 0.1, far: 120, position: [0, 7.2, 9.5] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      flat
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 24, 70]} />
      <Clock state={state} />
      <Rig state={state} mobile={mobile} />
      <Floor state={state} />
      <Dial state={state} />
      <Column state={state} />
    </Canvas>
  );
}
