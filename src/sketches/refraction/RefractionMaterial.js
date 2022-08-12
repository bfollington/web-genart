import { ShaderMaterial } from 'three'

export default class RefractionMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      vertexShader: `varying vec3 worldNormal;
      varying vec3 viewDirection;
      void main() {
        vec4 transformedNormal = vec4(normal, 0.);
        vec4 transformedPosition = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          transformedNormal = instanceMatrix * transformedNormal;
          transformedPosition = instanceMatrix * transformedPosition;
        #endif
        worldNormal = normalize( modelViewMatrix * transformedNormal).xyz;
        viewDirection = normalize((modelMatrix * vec4( position, 1.0)).xyz - cameraPosition);;
        gl_Position = projectionMatrix * modelViewMatrix * transformedPosition;
      }`,
      fragmentShader: `uniform sampler2D envMap;
      uniform sampler2D backfaceMap;
      uniform vec2 resolution;
      varying vec3 worldNormal;
      varying vec3 viewDirection;
      float fresnel(vec3 eyeVector, vec3 worldNormal) {
        return pow( 1.0 + dot( eyeVector, worldNormal), 3.0 );
      }
      void main() {
        // get screen coordinates
        vec2 uv = gl_FragCoord.xy / resolution;

        vec3 backfaceNormal = texture2D(backfaceMap, uv).rgb;
        float a = 0.33;
        vec3 normal = worldNormal * (1.0 - a) - backfaceNormal * a;
        // calculate refraction and add to the screen coordinates
        float ior = 1.33;
        vec3 refracted = refract(viewDirection, normal, 1.0/ior);
        uv += refracted.xy;

        // sample the background texture
        vec4 tex = texture2D(envMap, uv);

        vec4 o = tex;

        // calculate the Fresnel ratio
        float f = fresnel(viewDirection, normal);

        // mix the refraction color and reflection color
        o.rgb = mix(o.rgb, vec3(1.0), f);

        gl_FragColor = vec4(o.rgb, 1.0);
      }`,
      uniforms: {
        envMap: { value: options.envMap },
        backfaceMap: { value: options.backfaceMap },
        resolution: { value: options.resolution },
      },
    })
  }
}
