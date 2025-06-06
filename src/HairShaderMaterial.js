// src/HairShaderMaterial.js
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// vértices muy básicos
const vertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
}`

// fragment con HSL <→> RGB y ajustes
const fragment = /* glsl */ `
uniform sampler2D map;
uniform float uHue;       // [0..1]
uniform float uSat;       // e.g. 0..2
uniform float uLight;     // -1..1
varying vec2 vUv;

// RGB → HSL
vec3 rgb2hsl(vec3 c){
  float M = max(max(c.r,c.g),c.b);
  float m = min(min(c.r,c.g),c.b);
  float d = M-m;
  float h=0., s=0., l=(M+m)/2.;
  if(d>0.){
    s = l<0.5 ? d/(M+m) : d/(2.-M-m);
    if(M==c.r) h = mod((c.g-c.b)/d,6.);
    else if(M==c.g) h = (c.b-c.r)/d + 2.;
    else h = (c.r-c.g)/d + 4.;
    h /= 6.;
  }
  return vec3(h,s,l);
}

// HSL → RGB
float hue2rgb(float p,float q,float t){
  if(t<0.) t+=1.; if(t>1.) t-=1.;
  if(t<1./6.) return p+(q-p)*6.*t;
  if(t<1./2.) return q;
  if(t<2./3.) return p+(q-p)*(2./3.-t)*6.;
  return p;
}
vec3 hsl2rgb(vec3 hsl){
  float h=hsl.x, s=hsl.y, l=hsl.z;
  if(s==0.) return vec3(l);
  float q = l<0.5 ? l*(1.+s) : l+s-l*s;
  float p = 2.*l-q;
  return vec3(
    hue2rgb(p,q,h+1./3.),
    hue2rgb(p,q,h),
    hue2rgb(p,q,h-1./3.)
  );
}

void main(){
  vec4 tex = texture2D(map, vUv);
  vec3 hsl = rgb2hsl(tex.rgb);
  // aplicamos los ajustes
  hsl.x = mod(hsl.x + uHue, 1.0);
  hsl.y = clamp(hsl.y * uSat, 0.0, 1.0);
  hsl.z = clamp(hsl.z + uLight, 0.0, 1.0);
  vec3 rgb = hsl2rgb(hsl);
  gl_FragColor = vec4(rgb, tex.a);
}`

// crea el material y hazlo disponible
const HairShaderMaterial = shaderMaterial(
  { map: null, uHue: 0, uSat: 1, uLight: 0 },
  vertex,
  fragment
)

extend({ HairShaderMaterial })
export default HairShaderMaterial
