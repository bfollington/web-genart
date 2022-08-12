import { shaderMaterial } from '@react-three/drei'

import { extend } from '@react-three/fiber'
import { Color } from 'three'

const RefractionMaterial = shaderMaterial(
  {
    texture: null,
    hasTexture: 0,
    scale: 0,
    shift: 0,
    opacity: 1,
    color: new Color('white'),
  },
  `uniform float scale;
      uniform float shift;
      varying vec2 vUv;
      void main() {
        vec3 pos = position;
        pos.y = pos.y + ((sin(uv.x * 3.1415926535897932384626433832795) * shift * 5.0) * 0.125);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
      }`,
  `uniform sampler2D tex;
      uniform float hasTexture;
      uniform float shift;
      uniform float scale;
      uniform vec3 color;
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        float angle = 1.55;
        vec2 p = (vUv - vec2(0.5, 0.5)) * (1.0 - scale) + vec2(0.5, 0.5);
        vec2 offset = shift / 4.0 * vec2(cos(angle), sin(angle));
        vec4 cr = texture2D(tex, p + offset);
        vec4 cga = texture2D(tex, p);
        vec4 cb = texture2D(tex, p - offset);
        if (hasTexture == 1.0) gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
        else gl_FragColor = vec4(color, opacity);
      }`
)

extend({ RefractionMaterial })

type RefractionMaterialImpl = {
  texture: THREE.Texture | null
  hasTexture: number
  scale: number
  shift: number
  opacity: number
  color: THREE.Color
} & JSX.IntrinsicElements['shaderMaterial']

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      refractionMaterial: RefractionMaterialImpl
    }
  }
}

export default RefractionMaterial
