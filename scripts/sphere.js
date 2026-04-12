/* ════════════════════════════════════════════════════════
   THREE.JS DISPLACEMENT SPHERE
   – Simplex Noise vertex displacement (GLSL)
   – Two-tone colour gradient fragment shader
   – Mouse parallax · theme-aware colours
════════════════════════════════════════════════════════ */

const _vert = /* glsl */`
  uniform float uTime;
  uniform float uStrength;
  varying vec2  vUv;
  varying float vDisplace;

  vec3 mod289v3(vec3 x){ return x - floor(x*(1./289.))*289.; }
  vec4 mod289v4(vec4 x){ return x - floor(x*(1./289.))*289.; }
  vec4 permute(vec4 x) { return mod289v4(((x*34.)+1.)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1./6.,1./3.);
    const vec4 D = vec4(0.,.5,1.,2.);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1. - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289v3(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.,i1.z,i2.z,1.))
             + i.y + vec4(0.,i1.y,i2.y,1.))
             + i.x + vec4(0.,i1.x,i2.x,1.));
    float n_  = .142857142857;
    vec3  ns  = n_ * D.wyz - D.xzx;
    vec4  j   = p - 49. * floor(p * ns.z * ns.z);
    vec4  x_  = floor(j * ns.z);
    vec4  y_  = floor(j - 7. * x_);
    vec4  x   = x_ * ns.x + ns.yyyy;
    vec4  y   = y_ * ns.x + ns.yyyy;
    vec4  h   = 1. - abs(x) - abs(y);
    vec4  b0  = vec4(x.xy, y.xy);
    vec4  b1  = vec4(x.zw, y.zw);
    vec4  s0  = floor(b0)*2.+1.;
    vec4  s1  = floor(b1)*2.+1.;
    vec4  sh  = -step(h, vec4(0.));
    vec4  a0  = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4  a1  = b1.xzyw + s1.xzyw*sh.zzww;
    vec3  p0  = vec3(a0.xy, h.x);
    vec3  p1  = vec3(a0.zw, h.y);
    vec3  p2  = vec3(a1.xy, h.z);
    vec3  p3  = vec3(a1.zw, h.w);
    vec4  norm = taylorInvSqrt(
                   vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m = max(.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m = m * m;
    return 42. * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main(){
    vUv = uv;
    vec3 pos = position;
    float n  = snoise(pos * 1.4 + uTime * 0.22);
    float n2 = snoise(pos * 2.8 - uTime * 0.14) * 0.5;
    float d  = (n + n2) * uStrength;
    vDisplace = d;
    pos += normal * d;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  }
`;

const _frag = /* glsl */`
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uOpacity;
  varying float vDisplace;

  void main(){
    float t   = clamp((vDisplace + 0.55) * 0.85, 0., 1.);
    vec3  col = mix(uColorA, uColorB, t);
    gl_FragColor = vec4(col, uOpacity);
  }
`;

(function initSphere() {
  const canvas = document.getElementById('sphereCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 5.5;

  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  const uniforms = {
    uTime    : { value: 0 },
    uStrength: { value: 0.48 },
    uColorA  : { value: new THREE.Color(isDark() ? '#061c2e' : '#b2dfdb') },
    uColorB  : { value: new THREE.Color('#5eead4') },
    uOpacity : { value: isDark() ? 0.82 : 0.65 },
  };

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 140, 140),
    new THREE.ShaderMaterial({
      vertexShader  : _vert,
      fragmentShader: _frag,
      uniforms,
      transparent   : true,
      depthWrite    : false,
    })
  );
  scene.add(sphere);

  function layout() {
    if (innerWidth < 768) {
      sphere.position.set(0, 1.4, 0);
      uniforms.uStrength.value = 0.35;
    } else {
      sphere.position.set(2.8, -0.4, 0);
      uniforms.uStrength.value = 0.48;
    }
  }

  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    layout();
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  window.updateSphereTheme = function () {
    uniforms.uColorA.value.set(isDark() ? '#061c2e' : '#b2dfdb');
    uniforms.uOpacity.value = isDark() ? 0.82 : 0.65;
  };

  const mouse  = new THREE.Vector2(0, 0);
  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / innerWidth)  * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  const clock = new THREE.Clock();

  (function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    sphere.rotation.y = t * 0.07;
    sphere.rotation.x = t * 0.035;

    if (innerWidth >= 768) {
      sphere.position.x += (2.8 + mouse.x * 0.35 - sphere.position.x) * 0.028;
      sphere.position.y += (-0.4 + mouse.y * 0.25 - sphere.position.y) * 0.028;
    }
    renderer.render(scene, camera);
  })();
})();
