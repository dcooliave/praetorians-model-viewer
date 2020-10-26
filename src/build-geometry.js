import loadGeometry from './load-geometry.js'
import { GEOMETRY_ANIMATED, GEOMETRY_RIGID } from './types.js'

function buildRigidGeometry(mesh) {
  const geometries = []

  for (let [i, surface] of mesh.geometry.surfaces.entries()) {
    geometries.push(loadGeometry(mesh.geometry.vertices[i], surface.indices))
  }

  mesh.model.geometry = geometries
  geometries.forEach(geometry => mesh.model.resources.add(geometry))
}

function buildAnimatedGeometry(mesh) {
  const groups = []
  const indices = []

  let offset = 0

  for (let [i, surface] of mesh.geometry.surfaces.entries()) {
    groups.push({
      start: indices.length,
      count: surface.indices.length,
      material: i
    })

    surface.indices.forEach(n => indices.push(offset + n))
    offset += surface.numVertices
  }

  const geometry = loadGeometry(mesh.geometry.vertices, indices, groups)
  mesh.model.geometry = geometry
  mesh.model.resources.add(geometry)
}

export default function(mesh) {
  if (mesh.type == GEOMETRY_RIGID) {
    buildRigidGeometry(mesh)
  } else if (mesh.type == GEOMETRY_ANIMATED) {
    buildAnimatedGeometry(mesh)
  }
}
