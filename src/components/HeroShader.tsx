"use client";

import { useEffect, useRef } from "react";

// Domain-warped fbm in the site palette. Pointer gently pulls the field; text zone stays calm for contrast.
const FRAG = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m;
const vec3 INK  = vec3(0.055, 0.059, 0.102);
const vec3 SURF = vec3(0.114, 0.118, 0.192);
const vec3 LAV  = vec3(0.710, 0.631, 1.000);
const vec3 PINK = vec3(0.949, 0.541, 0.769);
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5; mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++){ v += a*noise(p); p = R*p*2.02; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec2 p = (gl_FragCoord.xy - 0.5*r) / min(r.x, r.y);
  float T = t * 0.045;
  vec2 d = m - p;
  p += d * 0.18 * exp(-dot(d, d) * 3.0);
  vec2 q = vec2(fbm(p*1.3 + vec2(T, 0.0)), fbm(p*1.3 + vec2(5.2, -T)));
  vec2 s = vec2(fbm(p*1.1 + 1.7*q + vec2(1.7, 9.2) + T*0.6), fbm(p*1.1 + 1.7*q + vec2(8.3, 2.8) - T*0.4));
  float f = fbm(p*1.2 + 2.0*s);

  vec3 col = mix(INK, SURF * 1.35, smoothstep(0.1, 0.6, f));
  col = mix(col, LAV * 0.82, smoothstep(0.32, 0.78, f) * smoothstep(0.1, 0.8, s.x));
  col = mix(col, PINK * 0.92, smoothstep(0.42, 0.85, f) * smoothstep(0.25, 0.85, q.y));

  // Calmer band where the copy sits, brighter toward the edges and bottom.
  float calm = smoothstep(0.5, 0.0, length((uv - vec2(0.5, 0.55)) * vec2(1.15, 1.7)));
  col = mix(col, INK, calm * 0.55);
  col *= 1.0 - 0.18 * length(uv - 0.5);
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) * 0.03; // grain kills banding
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

export function HeroShader() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return; // section background (ink) is the fallback

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uM = gl.getUniformLocation(prog, "m");

    // ponytail: fixed 0.6 render scale; the field is soft so it upsamples cleanly. Raise if it ever looks blurry.
    const SCALE = 0.6;
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uR, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pointer target in shader space, followed with a soft lerp so it drifts rather than snaps.
    const target = { x: 0.6, y: -0.2 };
    const pos = { ...target };
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      const k = Math.min(b.width, b.height);
      target.x = (e.clientX - b.left - b.width / 2) / k;
      target.y = -(e.clientY - b.top - b.height / 2) / k;
    };
    addEventListener("pointermove", onMove, { passive: true });

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now() - 40_000; // skip the uniform-looking first seconds
    let raf = 0;
    let visible = true;
    const frame = (now: number) => {
      pos.x += (target.x - pos.x) * 0.04;
      pos.y += (target.y - pos.y) * 0.04;
      gl.uniform1f(uT, (now - start) / 1000);
      gl.uniform2f(uM, pos.x, pos.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const resume = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) resume();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", resume);
    resume();
    requestAnimationFrame(() => canvas.classList.add("opacity-100"));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 size-full opacity-0 transition-opacity duration-[1600ms] ease-out [mask-image:linear-gradient(to_bottom,#000_72%,transparent)]"
    />
  );
}
