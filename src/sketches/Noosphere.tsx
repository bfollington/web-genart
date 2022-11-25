import * as THREE from 'three'
import { extend, useThree, useFrame, Canvas } from '@react-three/fiber'
import { Html, Image, ScreenQuad, shaderMaterial } from '@react-three/drei'
import React from 'react'
import { ShaderMaterial } from 'three'
import Logo from '../../public/assets/subconscious/42ef665a-2cfc-40d2-b303-90a7650ac74d_1000x1000.png'
const glsl = (x: any) => {
  return x[0]
}

const NoosphereMaterial = shaderMaterial(
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
  #define NUM_LAYER 5.


  mat2 Rot(float angle){
      float s=sin(angle), c=cos(angle);
      return mat2(c, -s, s, c);
  }
  
  
  mat2 mm2(in float a){float c = cos(a), s = sin(a);return mat2(c,-s,s,c);}
  
  
  //random number between 0 and 1
  float Hash21(vec2 p){
      p = fract(p*vec2(123.34, 456.21));
      p +=dot(p, p+45.32);
      return  fract(p.x*p.y);
  }
  
  float Star(vec2 uv, float flare){
      float d = length(uv);//center of screen is origin of uv -- length give us distance from every pixel to te center
      float m = .05/d;
      float rays = max(0., 1.-abs(uv.x*uv.y*1000.));
      m +=rays*flare;
      
      uv *=Rot(3.1415/4.);
      rays = max(0., 1.-abs(uv.x*uv.y*1000.));
      m +=rays*.3*flare;
      m *=smoothstep(1., .2, d);
      return m;
  }
  
  vec3 StarLayer(vec2 uv){
     
     vec3 col = vec3(0.);
     
      vec2 gv= fract(uv)-.5; //gv is grid view
      vec2 id= floor(uv);
      
      for(int y=-1; y<=1; y++){
          for(int x=-1; x<=1; x++){
              
              vec2 offset= vec2(x, y);
              float n = Hash21(id+offset);
              float size = fract(n*345.32);
                  float star= Star(gv-offset-(vec2(n, fract(n*34.))-.5), smoothstep(.9, 1., size)*.6);
              vec3 color = sin(vec3(.8, 0., .7)*fract(n*2345.2)*123.2)*.5*sin(iTime)+.5;
              color = color*vec3(.3, .1, .8+size / 50.);
              
              star *=sin(iTime*3.+n*6.2831)*.5+1.;
              col +=star*size*color; 
              
           }
       }
      return col;
  }
  
  float vignette(vec2 uv) {
      uv *=  1.0 - uv.yx;   //vec2(1.0)- uv.yx; -> 1.-u.yx; Thanks FabriceNeyret !
      
      float vig = uv.x*uv.y * 15.0; // multiply with sth for intensity
      
      vig = pow(vig, 0.25); // change pow for modifying the extend of the  vignette
      return vig;
  }
  
  vec3 tex(in vec2 p)
  {
      float frq =50.3;
      p += 0.405;
      return vec3(1.)*smoothstep(.9, 1.05, max(sin((p.x)*frq),sin((p.y)*frq)));
  }
  
  vec3 hsv2rgb( in vec3 c )
  {
      vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z * mix( vec3(1.0), rgb, c.y);
  }
  
  //HEALPix  (debugged and cleaned from: http://www.cse.cuhk.edu.hk/~ttwong/papers/spheremap/spheremap.html)
  //Has several advantages, might not be as versatile as cubemapped.
  vec3 healpix(vec3 p)
  {
    float a = atan(p.z, p.x) * 0.63662; 
    float h = 3.*abs(p.y);
    float h2 = .75*p.y;
    vec2 uv = vec2(a + h2, a - h2);
    h2 = sqrt(3. - h);
    float a2 = h2 * fract(a);
      uv = mix(uv, vec2(-h2 + a2, a2), step(2., h));    
      
      vec3 col = tex(uv);
      col.x = a*0.5;
      return hsv2rgb(vec3(col.x,.8,col.z));
  }
  
  vec3 sphproj(in vec3 p)
  {
      vec2 sph = vec2(acos(p.y/length(p)), atan(p.z,p.x));
      
      vec3 col = tex(sph*2.);
      col.x = sph.x*0.4;
      return hsv2rgb(vec3(.7,.8,col.z));
  }
  
  float iSphere(in vec3 ro, in vec3 rd)
  {
      vec3 oc = ro;
      float b = dot(oc, rd);
      float c = dot(oc,oc) - 1.;
      float h = b*b - c;
      if(h <0.0) return -1.;
      return -b - sqrt(h);
  }
  
  float blendScreen(float base, float blend) {
    return 1.0-((1.0-base)*(1.0-blend));
  }
  
  vec3 blendScreen(vec3 base, vec3 blend) {
    return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
  }
  
  vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
    return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
  }
  
  
  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
      vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
      vec2 rawUv = fragCoord.xy / iResolution.xy;
      float vig = vignette(rawUv);
      float t=  iTime*.02;
      vec2 M = vec2(0);
      uv *=Rot(t);
      uv +=M*4.;
      
      vec3 col = vec3(0.2588235294, 0.1254901961, 0.2549019608);
      
      for(float i =0.; i<1.; i += 1./NUM_LAYER){
          float depth = fract(i+t);
          float scale= mix(10.,.5, depth);
          float fade = depth*smoothstep(1., .9, depth);
          col += StarLayer(uv*scale+i*453.32-M)*fade;
      }
      fragColor = vec4(col * 0.5,1.0);
      
      float k = (sin(iTime / 1.0) + 1.0)/4.0 + 0.75;
     
      #define heartoffset vec2(sin(uv.x + iTime)*10., cos(uv.x * 10. + 0.01*sin(iTime) + iTime)*15.*(1.5-uv.y)*0.4)
      #define heartcoord fract(((fragCoord.xy + heartoffset) - iResolution.xy/2.) / cellsize)
      
      //vec3 col = vec3(0.2588235294, 0.1254901961, 0.2549019608);
  
      
      // Add a bit of shading to make things seem more 3-dimensional
      //fragColor -= (heartoffset.y + heartoffset.x) * 0.01 * k * (1.-uv.y)*0.4;
      fragColor -= vec4((1.-uv.y)*0.1*k,0,0,1.);
      fragColor -= (vec4(uv.y, uv.y * 0.8, uv.y, 1.)) / 8.0;
      
      
      vec2 p = fragCoord.xy/iResolution.xy-0.5;
    p.x*=iResolution.x/iResolution.y;
    vec2 um = M;
    um.x *= iResolution.x/iResolution.y;
      p*= 1.5;
    
      //camera
    vec3 ro = vec3(0.,0.,5.);
      vec3 rd = normalize(vec3(p,-1.5));
      mat2 mx = mm2(iTime*.2+um.x*5.);
      mat2 my = mm2(iTime*0.0+um.y*-2. + -.1); 
      ro.xz *= mx;rd.xz *= mx;
      ro.xy *= my;rd.xy *= my;
     
      
      col = sphproj(rd);
      
    //fragColor = mix(fragColor, vec4(col, 1.0), .1);
      fragColor = vec4(blendScreen(fragColor.xyz, col * .2), 1.);
      
      
      fragColor *=  vig;
      }

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `
)

extend({ NoosphereMaterial })

type NoosphereMaterialImpl = {
  iTime: number
  iMouse: number[]
  iResolution: number[]
} & JSX.IntrinsicElements['shaderMaterial']

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      noosphereMaterial: NoosphereMaterialImpl
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
      <noosphereMaterial
        ref={ref}
        iTime={0}
        iMouse={[0, 0]}
        iResolution={[size.width, size.height]}
      />
    </ScreenQuad>
  )
}

const Noosphere = () => {
  return (
    <Canvas dpr={1}>
      <ScreenQuadScene />
      <Html>
        <div
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img style={{ maxWidth: '50vw' }} src="/assets/subconscious/noosphere.png" />
        </div>
      </Html>
    </Canvas>
  )
}

export default Noosphere
