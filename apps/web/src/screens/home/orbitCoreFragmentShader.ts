export const orbitCoreFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
    float rim = pow(1.0 - facing, 2.2);
    float breath = 0.92 + 0.08 * sin(uTime * 0.8);
    vec3 surface = uColor * (0.45 + 0.85 * rim) * breath;
    gl_FragColor = vec4(surface, 1.0);
  }
`
