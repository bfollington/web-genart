import * as THREE from 'three'
import { extend, useThree, useFrame, Canvas } from '@react-three/fiber'
import { Html, Image, ScreenQuad, shaderMaterial } from '@react-three/drei'
import React from 'react'
import { ShaderMaterial } from 'three'
import Logo from '../../public/assets/subconscious/42ef665a-2cfc-40d2-b303-90a7650ac74d_1000x1000.png'
const glsl = (x: any) => {
  return x[0]
}

const SubconsciousIIMaterial = shaderMaterial(
  { iTime: 0, iMouse: new THREE.Vector2(), iResolution: new THREE.Vector2() },
  glsl`
  void main() {
    gl_Position = vec4(position, 1.0);
  }
  `,
  glsl`
  uniform float iTime;
  uniform vec2 iResolution;
  uniform vec2 iMouse;

  // Fork of "Pale Silk" by R3N. https://shadertoy.com/view/NdVXDw
// 2022-11-24 01:10:01

// Updated have more configuration and add photoshop blend modes on existing textures
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20151020 (hassoncs)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
// 

const float noiseSizeCoeff = 0.61; // Bigger => larger glitter spots
const float noiseDensity = 53.0;  // Bigger => larger glitter spots


vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(noiseSizeCoeff - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return noiseDensity * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}


float softLight( float s, float d )
{
	return (s < 0.5) ? d - (1.0 - 2.0 * s) * d * (1.0 - d) 
		: (d < 0.25) ? d + (2.0 * s - 1.0) * d * ((16.0 * d - 12.0) * d + 3.0) 
					 : d + (2.0 * s - 1.0) * (sqrt(d) - d);
}

vec3 softLight( vec3 s, vec3 d )
{
	vec3 c;
	c.x = softLight(s.x,d.x);
	c.y = softLight(s.y,d.y);
	c.z = softLight(s.z,d.z);
	return c;
}

float hardLight( float s, float d )
{
	return (s < 0.5) ? 2.0 * s * d : 1.0 - 2.0 * (1.0 - s) * (1.0 - d);
}

vec3 hardLight( vec3 s, vec3 d )
{
	vec3 c;
	c.x = hardLight(s.x,d.x);
	c.y = hardLight(s.y,d.y);
	c.z = hardLight(s.z,d.z);
	return c;
}

float vividLight( float s, float d )
{
	return (s < 0.5) ? 1.0 - (1.0 - d) / (2.0 * s) : d / (2.0 * (1.0 - s));
}

vec3 vividLight( vec3 s, vec3 d )
{
	vec3 c;
	c.x = vividLight(s.x,d.x);
	c.y = vividLight(s.y,d.y);
	c.z = vividLight(s.z,d.z);
	return c;
}

vec3 linearLight( vec3 s, vec3 d )
{
	return 2.0 * s + d - 1.0;
}

float pinLight( float s, float d )
{
	return (2.0 * s - 1.0 > d) ? 2.0 * s - 1.0 : (s < 0.5 * d) ? 2.0 * s : d;
}

vec3 pinLight( vec3 s, vec3 d )
{
	vec3 c;
	c.x = pinLight(s.x,d.x);
	c.y = pinLight(s.y,d.y);
	c.z = pinLight(s.z,d.z);
	return c;
}

float vignette(vec2 uv) {
    uv *=  1.0 - uv.yx;   //vec2(1.0)- uv.yx; -> 1.-u.yx; Thanks FabriceNeyret !
    
    float vig = uv.x*uv.y * 15.0; // multiply with sth for intensity
    
    vig = pow(vig, 0.25); // change pow for modifying the extend of the  vignette
    return vig;
}


void mainImage(out vec4 col, vec2 fragCoord){
    vec2 uv = fragCoord/iResolution.y;
    float t = 0.5*iTime;
	uv.y += 0.03*sin(8.0*uv.x-t);
    float f = 0.6+0.4*sin(5.0*(uv.x+uv.y+cos(3.0*uv.x+5.0*uv.y)+0.02*t)+sin(20.0*(uv.x+uv.y-0.1*t)));
    float b = 1.7;
    col = vec4(0.2588235294*b, 0.1254901961*b, 0.2549019608*b, 1.)*vec4(f);

    
    
    uv = fragCoord.xy / iResolution.xy;
    float vig = vignette(uv);
 
    float fadeLR = .7 - abs(uv.x - .4);
    float fadeTB = 1.1 - uv.y;
    vec3 pos = vec3(uv * vec2( 3. , 1.) - vec2(0., iTime * .00005), iTime * .006);
   
    float n = fadeLR * fadeTB * smoothstep(.50, 1.0, snoise(pos * iResolution.y / 5.)) * 8.;
  
    // a bunch of constants here to shift the black-white of the noise to a greyer tone
    vec3 noiseGreyShifted = min((vec3(n) + 1.) / 3. + .3, vec3(1.)) * .91;
    
    
    vec3 mixed = col.xyz;
    //mixed = softLight(noiseGreyShifted, s);
    //mixed = mix(col.xyz, hardLight(noiseGreyShifted, col.xyz), .2);
    mixed = mix(col.xyz, vividLight(noiseGreyShifted, col.xyz), .05);
    //mixed = pinLight(noiseGreyShifted, col.xyz);
    //mixed = linearLight(noiseGreyShifted, s);
    
	col = vec4(mixed, 1.0) * vig;
    
    float k = (sin(iTime / 1.0) + 1.0)/4.0 + 0.75;
   
    #define heartoffset vec2(sin(uv.x + iTime)*10., cos(uv.x * 10. + 0.01*sin(iTime) + iTime)*15.*(1.5-uv.y)*0.4)
    #define heartcoord fract(((fragCoord.xy + heartoffset) - iResolution.xy/2.) / cellsize)
    
    //vec3 col = vec3(0.2588235294, 0.1254901961, 0.2549019608);

    
    // Add a bit of shading to make things seem more 3-dimensional
    col -= (heartoffset.y + heartoffset.x) * 0.01 * k * (1.-uv.y)*0.4;
    col -= vec4((1.-uv.y)*0.1*k,0,0,0.);
    col -= (vec4(uv.y, uv.y * 0.8, uv.y, 0.)) / 8.0;
}

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `
)

extend({ SubconsciousIIMaterial })

type SubconsciousIIMaterialImpl = {
  iTime: number
  iMouse: number[]
  iResolution: number[]
} & JSX.IntrinsicElements['shaderMaterial']

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      subconsciousIIMaterial: SubconsciousIIMaterialImpl
    }
  }
}

function ScreenQuadScene() {
  const size = useThree((state) => state.size)
  const ref = React.useRef<ShaderMaterial>(null)
  useFrame((state) => {
    if (!ref.current) return

    if (ref.current.uniforms) {
      ref.current.uniforms.iTime.value = state.clock.elapsedTime
      ref.current.uniforms.iMouse.value = new THREE.Vector2(
        -state.mouse.x * size.width,
        -state.mouse.y * size.height
      )
    }
  })

  return (
    <ScreenQuad>
      <subconsciousIIMaterial
        ref={ref}
        iTime={0}
        iMouse={[0, 0]}
        iResolution={[size.width, size.height]}
      />
    </ScreenQuad>
  )
}

const SubconsciousII = () => {
  return (
    <Canvas dpr={1}>
      <ScreenQuadScene />
      <Html>
        <div
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            style={{ maxWidth: '75vw' }}
            src="/assets/subconscious/subconscious-shadow.png"
          />
        </div>
      </Html>
    </Canvas>
  )
}

export default SubconsciousII
