import { Group, LessDepth, Mesh, Uniform } from 'three'

import * as Types from './types.js'

export default function(mesh, transforms) {
  if (mesh.type == Types.GEOMETRY_RIGID) {
    const transformGroup = new Group()

    for (const [geometryIndex, geometry] of mesh.model.geometry.entries()) {
      const object = new Mesh(geometry, mesh.model.materials[geometryIndex])

      if (mesh.geometry.surfaces[geometryIndex].material == Types.MATERIAL_ALPHA) {
        object.material.uniforms.uAlphaTest.value = 0.75
        const edgeMesh = object.clone()
        edgeMesh.material = object.material.clone()
        edgeMesh.material.depthWrite = false
        edgeMesh.material.depthFunc = LessDepth
        edgeMesh.material.uniforms.uTexture = new Uniform(object.material.uniforms.uTexture.value)
        edgeMesh.material.uniforms.uAlphaTest = new Uniform(0.1)
        edgeMesh.renderOrder = 1
        transformGroup.add(edgeMesh)
        mesh.model.resources.add(edgeMesh.material)
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
