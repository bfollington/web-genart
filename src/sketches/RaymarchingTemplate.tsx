import * as THREE from 'three'
import { extend, useThree, useFrame, Canvas } from '@react-three/fiber'
import { ScreenQuad, shaderMaterial } from '@react-three/drei'
import React from 'react'
import { ShaderMaterial } from 'three'
const glsl = (x: any) => {
  return x[0]
}

const RaymarchingTemplateMaterial = shaderMaterial(
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

  //------------------------------------------------------------------------
// SDF sculpting
//
// Thsi is the SDF function F that defines the shapes, in this case a sphere
// of radius 1. More info: https://iquilezles.org/articles/distfunctions/
//------------------------------------------------------------------------


mat2 rM; // Rotation matrix.


//Distance Functions
float sd_sph(vec3 p, float r) { return length(p) - r; }

float sdOctahedron( vec3 p, float s)
{
  p = abs(p);
  return (p.x+p.y+p.z-s)*0.57735027;
}



float doModel( vec3 p )
{
    // return sdOctahedron(p, 1.0);
    return length(p) - 1.0;
    
    // comment line in order to try this fun SDF below
    return min( min( length(p.xyz)-1.0, length(p.xy)-0.2 ),
                min( length(p.yz )-0.2, length(p.zx)-0.2 ) );
}


vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 rainbow_pal(in float t) {
return pal( t, vec3(0.8,0.5,0.4),vec3(0.2,0.4,0.2),vec3(2.0,1.0,1.0),vec3(0.0,0.25,0.25) );
}


//------------------------------------------------------------------------
// Material 
//
// Defines the material (colors, shading, pattern, texturing) of the model
// at every point based on its position and normal. In this case, it simply
// returns a constant yellow color.
//------------------------------------------------------------------------
vec3 doMaterial( in vec3 pos, in vec3 nor )
{
    return mix(rainbow_pal(iTime * 0.5 + 0.5), vec3(1, 1, 1), 1.-dot(nor, pos));
}

//------------------------------------------------------------------------
// Lighting
//------------------------------------------------------------------------

vec3 doLighting( in vec3 pos, in vec3 nor, in vec3 rd, in float dis, in vec3 mal )
{
    vec3 lin = vec3(0.0);

    // key light
    //-----------------------------
    vec3  lig = normalize(vec3(1.0,0.7,0.9)) / 2.;
    float dif = max(dot(nor,lig),0.0);
    lin += dif*vec3(4.00,4.00,4.00);

    // ambient light
    //-----------------------------
    // lin += vec3(0.50,0.50,0.50);

    
    // surface-light interacion
    //-----------------------------
    vec3 col = mal*lin;

    
    // fog    
    //-----------------------------
	col *= exp(-0.01*dis*dis);

    return col;
}

//------------------------------------------------------------------------
// Camera
//
// Move the camera. In this case it's using time and the mouse position
// to orbitate the camera around the origin of the world (0,0,0), where
// the yellow sphere is.
//------------------------------------------------------------------------
void doCamera( out vec3 camPos, out vec3 camTar, in float time )
{
    float an = 0.3*iTime;
	camPos = vec3(3.5*sin(an),1.0,3.5*cos(an));
    camTar = vec3(0.0,0.0,0.0);
}


//------------------------------------------------------------------------
// Background 
//
// The background color. In this case it's just a black color.
//------------------------------------------------------------------------
vec3 doBackground( void )
{
    return vec3( 0.0, 0.0, 0.0);
}


//=============================================================

// more info: https://iquilezles.org/articles/normalsSDF/
vec3 compute_normal( in vec3 pos )
{
    const float eps = 0.02;             // precision of the normal computation
    const vec3 v1 = vec3( 1.0,-1.0,-1.0);
    const vec3 v2 = vec3(-1.0,-1.0, 1.0);
    const vec3 v3 = vec3(-1.0, 1.0,-1.0);
    const vec3 v4 = vec3( 1.0, 1.0, 1.0);
	return normalize( v1*doModel( pos + v1*eps ) + 
					  v2*doModel( pos + v2*eps ) + 
					  v3*doModel( pos + v3*eps ) + 
					  v4*doModel( pos + v4*eps ) );
}

float intersect( in vec3 ro, in vec3 rd )
{
	const float maxd = 20.0;           
    float t = 0.0;
    for( int i=0; i<128; i++ )          // max number of raymarching iterations is 90
    {
	    float d = doModel( ro+rd*t );
        if( d<0.001 || t>20.0 ) break;  // precision 0.001, maximum distance 20
        t += d;
    }
    return (t<maxd) ? t : -1.0;
}

vec3 color( in vec2 uv )
{
    // camera movement (ro is ray origin, ta is the target location we are looking at)
    vec3 ro, ta; 
    doCamera( ro, ta, iTime );

    // camera matrix
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    mat3 camMat = mat3( uu, vv, ww );
    
	// create ray
	vec3 rd = normalize( camMat * vec3(uv,2.0) ); // 2.0 is the lens length

    // compute background
	vec3 col = doBackground();

	// project/intersect through raymarching of SDFs
    float t = intersect( ro, rd );
    if( t>-0.5 )
    {
        // geometry
        vec3 pos = ro + t*rd;
        vec3 nor = compute_normal(pos);

        // materials
        vec3 mal = doMaterial( pos, nor );

        // lighting
        col = doLighting( pos, nor, rd, t, mal );
	}

    // monitor gamma adjustnment
	col = pow( clamp(col,0.0,1.0), vec3(0.4545) );
	   
    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (1.0*fragCoord-iResolution.xy)/iResolution.y;
    
    fragColor = vec4( color(uv), 1.0 );
}

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `
)

extend({ RaymarchingTemplateMaterial })

type RaymarchingTemplateMaterialImpl = {
  iTime: number
  iMouse: number[]
  iResolution: number[]
} & JSX.IntrinsicElements['shaderMaterial']

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      raymarchingTemplateMaterial: RaymarchingTemplateMaterialImpl
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
      <raymarchingTemplateMaterial
        ref={ref}
        iTime={0}
        iMouse={[0, 0]}
        iResolution={[size.width, size.height]}
      />
    </ScreenQuad>
  )
}

const RaymarchingTemplate = () => {
  return (
    <Canvas>
      <ScreenQuadScene />
    </Canvas>
  )
}

export default RaymarchingTemplate
