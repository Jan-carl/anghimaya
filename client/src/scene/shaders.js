/**
 * Scanline wave shaders para sa wireframe overlay ng terrain at libro.
 * Optimized para sa mobile GPUs (low ALU operations, mediump precision, zero redundant math).
 */
export const wireVertexShader = /* glsl */ `
  varying highp vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const wireFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform vec3 uDirection;
  uniform vec3 uMin;
  uniform float uSpan;
  uniform float uSpeed;
  uniform float uCount;
  uniform float uWidth;
  uniform float uBaseOpacity;
  uniform float uOpacityBoost;
  uniform float uBaseGlow;
  uniform float uGlowBoost;
  uniform float uSoftness;
  varying highp vec3 vPos;

  void main() {
    float span = max(uSpan, 1e-4);
    vec3 dir = uDirection;
    float pos = dot(vPos - uMin, dir) / span;
    pos = fract(pos);
    float phase = pos * uCount - uTime * uSpeed;
    float tri = 1.0 - abs(fract(phase) * 2.0 - 1.0);
    float width = clamp(uWidth, 0.02, 0.6);
    float dist = (1.0 - tri) / width;
    // Pinasimple ang exp(-dist*dist)^softness tungo sa exp(-dist*dist*softness)
    // Nililimitahan sa 50.0 upang maiwasan ang half-precision overflow sa mobile GPUs
    float d2 = min(dist * dist * max(uSoftness, 1e-4), 50.0);
    float pulse = exp(-d2);
    float opacity = clamp(uBaseOpacity + uOpacityBoost * pulse, 0.0, 1.0);
    float glow = clamp(uBaseGlow + uGlowBoost * pulse, 0.0, 3.0);
    gl_FragColor = vec4(uColor * glow, opacity);
  }
`;