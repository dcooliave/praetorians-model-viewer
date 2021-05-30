import {
  DoubleSide,
  MeshStandardMaterial,
  ShaderMaterial,
  Uniform
} from './three/build/three.module.js'

import * as Types from './types.js'

export default function(mesh, textures) {
  for (const surface of mesh.geometry.surfaces) {
    const texture = textures[surface.textureID]

    if (texture) mesh.model.resources.add(texture)

    const material = new ShaderMaterial({
      uniforms: {
        uTexture: new Uniform(texture)
      },
      vertexShader: `
      #include <morphtarget_pars_vertex>

      attribute vec4 color;

      varying vec4 vcolor;
      varying vec2 vuv;

      void main() {
        #include <begin_vertex>
        #include <morphtarget_vertex>

        vuv = uv;
        vcolor = color / 255.;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
      }
      `,
      fragmentShader: `
      uniform sampler2D uTexture;

      varying vec4 vcolor;
      varying vec2 vuv;

      void main() {
        vec4 color = texture2D(uTexture, vuv);

        #ifdef ALPHATEST
        if (color.a < ALPHATEST) discard;
        #endif

        gl_FragColor = (color * vcolor).bgra;
      }
      `
    })

    switch (surface.material) {
      case Types.MATERIAL_ALPHA:
      material.transparent = true
      material.depthWrite = false
      material.depthTest = false
      break
      case Types.MATERIAL_ALPHATEST:
      material.alphaTest = .5
      break
      case Types.MATERIAL_SHADOW:
      material.transparent = true
      material.depthWrite = false
      break
    }

    mesh.model.materials.push(material)
    mesh.model.resources.add(material)
  }

  if (mesh.type == Types.GEOMETRY_ANIMATED) {
    mesh.model.materials.forEach(material => {
      material.morphTargets = true
    })
  } else if (mesh.type == Types.GEOMETRY_RIGID) {
    mesh.model.materials.forEach(material => {
      material.side = DoubleSide
    })
  }
}
