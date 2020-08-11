import { Group, Mesh } from './three.module.js'
import { GEOMETRY_ANIMATED, GEOMETRY_RIGID } from './types.js'

export default function(mesh, transforms) {
  if (mesh.type == GEOMETRY_RIGID) {
    const transformGroup = new Group()

    for (const [geometryIndex, geometry] of mesh.model.geometry.entries()) {
      transformGroup.add(new Mesh(geometry, mesh.model.materials[geometryIndex]))
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
  } else if (mesh.type == GEOMETRY_ANIMATED) {
    mesh.model.node = new Mesh(mesh.model.geometry, mesh.model.materials)
    mesh.model.node.animations = mesh.model.clips
    mesh.model.node.name = mesh.name
  }
}
