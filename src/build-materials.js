import {
  DataTexture,
  DoubleSide,
  MeshStandardMaterial,
  ShaderMaterial,
  Uniform
} from 'three'

import * as Types from './types.js'

export default function(mesh, textures) {
  const defaultTexture = new DataTexture(new Uint8Array([255, 255, 255, 255]))
  defaultTexture.needsUpdate = true

  for (const surface of mesh.geometry.surfaces) {
    const texture = textures[surface.textureID] || defaultTexture

    mesh.model.resources.add(texture)

    const material = new ShaderMaterial({
      uniforms: {
        uTexture: new Uniform(texture),
        uAlphaTest: new Uniform(0.0)
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
        vcolor = color;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
      }
      `,
      fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uAlphaTest;

      varying vec4 vcolor;
      varying vec2 vuv;

      void main() {
        vec4 color = texture2D(uTexture, vuv) * vcolor;

        if (color.a < uAlphaTest) discard;

        gl_FragColor = color.bgra;
      }
      `
    })

    switch (surface.material) {
      case Types.MATERIAL_ALPHA:
      material.transparent = true
      break
      case Types.MATERIAL_ALPHATEST:
      material.transparent = true
      material.uniforms.uAlphaTest.value = 0.5
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
