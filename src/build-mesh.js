import { Group, Mesh } from './three.module.js'

import * as Types from './types.js'

export default function(mesh, transforms) {
  if (mesh.type == Types.GEOMETRY_RIGID) {
    const transformGroup = new Group()

    for (const [geometryIndex, geometry] of mesh.model.geometry.entries()) {
      const object = new Mesh(geometry, mesh.model.materials[geometryIndex])

      switch (mesh.geometry.surfaces[geometryIndex].material) {
        case Types.MATERIAL_ALPHA:
        object.renderOrder = 3
        break
        case Types.MATERIAL_ALPHATEST:
        object.renderOrder = 1
        break
        case Types.MATERIAL_SHADOW:
        object.renderOrder = 2
        break
        default:
        object.renderOrder = 0
        break
      }

      transformGroup.add(object)
    }

    for (const transform of transforms) {
      if (transform.name == mesh.name) {
        const [w, x, y, z] = transform.rotation
        transformGroup.quaternion.set(x, y, z, w)
        transformGroup.position.set(...transform.translation)
        break
      }
    }

    mesh.model.node = transformGroup
    mesh.model.node.name = mesh.name
  } else if (mesh.type == Types.GEOMETRY_ANIMATED) {
    mesh.model.node = new Mesh(mesh.model.geometry, mesh.model.materials)
    mesh.model.node.animations = mesh.model.clips
    mesh.model.node.name = mesh.name
  }
}
