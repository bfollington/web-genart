import * as THREE from 'three'
import { extend, useThree, useFrame, Canvas } from '@react-three/fiber'
import { ScreenQuad, shaderMaterial } from '@react-three/drei'
import React from 'react'
import { ShaderMaterial } from 'three'
const glsl = (x: any) => {
  return x[0]
}

const FlightOfTheOctahedraMaterial = shaderMaterial(
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

  #define max_iters 500
    float max_dist = 1000.0;
    vec3 bg_col = vec3(0.8, 0.8, 1.0);
    vec3 fg_col = vec3(1.0, 1.0, 0.6);

    /**
     * Rotation matrix from angles
     */
    mat3 rotateX(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat3(
            vec3(1, 0, 0),
            vec3(0, c, s),
            vec3(0, -s, c)
        );
    }
    mat3 rotateY(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat3(
            vec3(c, 0, s),
            vec3(0, 1, 0),
            vec3(-s, 0, c)
        );
    }

    //the signed distance field function
    //used in the ray march loop
    float sdf(vec3 p, float r) {
        //a sphere of radius 1.
        return length( p ) - r;
    }

    float sdOctahedron( vec3 p, float s)
    {
      p = abs(p);
      return (p.x+p.y+p.z-s)*0.57735027;
    }


    vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
    {
        return a + b*cos( 6.28318*(c*t+d) );
    }

    vec3 pal_col(in float t) {

    return pal( t, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20) );
    }
    

    void mainImage( out vec4 fragColor, in vec2 fragCoord ){

    //1 : retrieve the fragment's coordinates
      vec2 uv = ( fragCoord.xy / iResolution.xy ) * 2.0 - 1.0;
      //preserve aspect ratio
      uv.x *= iResolution.x / iResolution.y;

        vec3 camera_pos = vec3(50. - iTime * 2.0, 50. + iTime * 1.5, 50. + iTime);
        vec3 camera_dir = vec3(0.5, 0.5, 0.5);

    //2 : camera position and ray direction
      vec3 pos = camera_pos;
      vec3 dir = camera_dir*.5 * normalize( vec3( uv, 3.0 ) );

    vec2 mos = (iMouse.xy / iResolution.xy) - vec2(0.5);
        // pos = rotateY(iTime / 6.0) * pos;
    dir = rotateY(mos.x * 3.0) * rotateX(mos.y * 3.0) * dir;
        
    //3 : ray march loop
        //ip will store final color
      vec3 col = pal_col(iTime / 100.);

      //variable step size
      float t = 0.0;

      for(int i = 0; i < max_iters; i++) {
            //update position along path
            vec3 ip = pos + dir * t;

            //gets the shortest distance to the scene
            float m = 16.0;
            ip = abs(mod(ip, m) - m*0.5);
        float d = sdOctahedron( ip, 2.5 * abs(sin(iTime + float(i))));

            //break the loop if the distance was too small
            //this means that we are close enough to the surface
            if (d < 0.01) {
                float a = float(i) / float(max_iters);
                float diffuse = dot(ip, vec3(0.6, 0.8, 0.0))*0.5 + 0.5;
                
                // colour based on depth
                col = pal_col( a*10. + iTime / 10.);
                break;
            }

        //increment the step along the ray path
        t += d;

            //break if too far
            if (t > max_dist) {
                break;
            }
      }
            

    //4 : apply color to this fragment
      fragColor = vec4(col, 1.0);

    }

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `
)

extend({ FlightOfTheOctahedraMaterial })

type FlightOfTheOctahedraMaterialImpl = {
  iTime: number
  iMouse: number[]
  iResolution: number[]
} & JSX.IntrinsicElements['shaderMaterial']

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      flightOfTheOctahedraMaterial: FlightOfTheOctahedraMaterialImpl
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
      <flightOfTheOctahedraMaterial
        ref={ref}
        iTime={0}
        iMouse={[0, 0]}
        iResolution={[size.width, size.height]}
      />
    </ScreenQuad>
  )
}

const FlightOfTheOctaHedra = () => {
  return (
    <Canvas>
      <ScreenQuadScene />
    </Canvas>
  )
}

export default FlightOfTheOctaHedra
