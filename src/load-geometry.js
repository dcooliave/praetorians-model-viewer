import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint8BufferAttribute,
  Uint16BufferAttribute
} from './three.module.js'

export default function(vertices, indices, groups = []) {
  const geometry = new BufferGeometry()

  geometry.setAttribute('position', new Float32BufferAttribute(vertices.points, 3))
  geometry.setAttribute('color', new Uint8BufferAttribute(vertices.colors, 4))
  geometry.setAttribute('uv', new Float32BufferAttribute(vertices.uv, 2))
  geometry.setIndex(new Uint16BufferAttribute(indices, 1))
  geometry.computeVertexNormals()

  groups.forEach(group => {
    geometry.addGroup(group.start, group.count, group.material)
  })

  return geometry
}
