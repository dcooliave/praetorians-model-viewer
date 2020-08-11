import {
  CustomBlending,
  DoubleSide,
  MeshStandardMaterial
} from './three.module.js'

import * as Types from './types.js'

export default function(mesh, textures) {
  for (const surface of mesh.geometry.surfaces) {
    const material = new MeshStandardMaterial()

    if (surface.textureID != -1) {
      material.map = textures[surface.textureID]
    }

    switch (surface.material) {
      case Types.MATERIAL_ALPHA:
      material.blending = CustomBlending
      material.alphaTest = .1
      material.transparent = true
      break
      case Types.MATERIAL_ALPHATEST:
      material.alphaTest = .1
      break
      case Types.MATERIAL_SHADOW:
      material.blending = CustomBlending
      material.transparent = true
      break
    }

    mesh.model.materials.push(material)
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
