import * as THREE from 'three'
import { extend, useThree, useFrame, Canvas } from '@react-three/fiber'
import { Html, Image, ScreenQuad, shaderMaterial } from '@react-three/drei'
import React from 'react'
import { ShaderMaterial } from 'three'
import Logo from '../../public/assets/subconscious/42ef665a-2cfc-40d2-b303-90a7650ac74d_1000x1000.png'
const glsl = (x: any) => {
  return x[0]
}

const SubconsciousMaterial = shaderMaterial(
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

// Fork of "Lovely Curtain" by DrLuke. https://shadertoy.com/view/MljczK
// 2022-11-22 23:34:15

/*
Wanted to make something with hearts, don't know why.

This work is licensed under a Creative Commons Attribution 4.0 International License.
https://creativecommons.org/licenses/by/4.0/
*/

float vignette(vec2 uv) {
  uv *=  1.0 - uv.yx;   //vec2(1.0)- uv.yx; -> 1.-u.yx; Thanks FabriceNeyret !
  
  float vig = uv.x*uv.y * 15.0; // multiply with sth for intensity
  
  vig = pow(vig, 0.25); // change pow for modifying the extend of the  vignette
  return vig;
}


vec2 rotate(vec2 v, float a) {
float s = sin(a);
float c = cos(a);
mat2 m = mat2(c, -s, s, c);
return m * v;
}
// Resolution dependent cell-size
#define cellsize (iResolution.x / 23.)
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

	vec2 uv = (fragCoord.xy*3. / iResolution.xy)-vec2(1);
    vec2 rawUv = fragCoord.xy / iResolution.xy;
    uv = rotate(uv, 0.025);
    float k = (sin(iTime / 1.0) + 1.0)/4.0 + 0.75;
   
    #define heartoffset vec2(sin(uv.x + iTime)*10., cos(uv.x * 10. + 0.01*sin(iTime) + iTime)*15.*(1.5-uv.y)*0.4)
    #define heartcoord fract(((fragCoord.xy + heartoffset) - iResolution.xy/2.) / cellsize)
    
    vec3 col = vec3(0.2588235294, 0.1254901961, 0.2549019608);

    
    // Add a bit of shading to make things seem more 3-dimensional
    col -= (heartoffset.y + heartoffset.x) * 0.01 * k * (1.-uv.y)*0.4;
    col -= vec3((1.-uv.y)*0.1*k,0,0);
    col -= (vec3(uv.y, uv.y * 0.8, uv.y)) / 8.0;
    col *= vignette(rawUv);
    
	fragColor = vec4(col, 1);
}
    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `
)

extend({ SubconsciousMaterial })

type SubconsciousMaterialImpl = {
  iTime: number
  iMouse: number[]
  iResolution: number[]
} & JSX.IntrinsicElements['shaderMaterial']

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      subconsciousMaterial: SubconsciousMaterialImpl
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
      <subconsciousMaterial
        ref={ref}
        iTime={0}
        iMouse={[0, 0]}
        iResolution={[size.width, size.height]}
      />
    </ScreenQuad>
  )
}

const Subconscious = () => {
  return (
    <Canvas dpr={1}>
      <ScreenQuadScene />
      <Html>
        <div
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img style={{ maxWidth: '75vw' }} src="/assets/subconscious/subconscious.png" />
        </div>
      </Html>
    </Canvas>
  )
}

export default Subconscious
