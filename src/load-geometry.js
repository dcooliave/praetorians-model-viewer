import {
  BufferGeometry,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  BufferAttribute
} from 'three'

export default function(vertices, indices, groups = []) {
  const floats = new InterleavedBuffer(new Float32Array(vertices), 9)
  const bytes = new InterleavedBuffer(new Uint8Array(vertices), 36)

  const geometry = new BufferGeometry()

  geometry.setAttribute('position', new InterleavedBufferAttribute(floats, 3, 0))
  geometry.setAttribute('color', new InterleavedBufferAttribute(bytes, 4, 24, true))
  geometry.setAttribute('uv', new InterleavedBufferAttribute(floats, 2, 7))
  geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1))

  groups.forEach(group => {
    geometry.addGroup(group.start, group.count, group.material)
  })

  return geometry
}
