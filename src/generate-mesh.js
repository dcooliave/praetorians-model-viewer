import { GEOMETRY_ANIMATED, GEOMETRY_RIGID } from './types.js'

export default function *(cursor) {
  const format = new DataView(cursor.data.buffer).getUint32(0, true)
  const numMeshes = cursor.readUint()

  for (let i = 0; i < numMeshes; i++) {
    cursor.push()

    const type = cursor.readUint()
    const name = cursor.readString()
    const sphere = Float32Array.from({ length: 4 }, cursor.readFloat, cursor)

    if ((type != GEOMETRY_RIGID) && (type != GEOMETRY_ANIMATED)) {
      console.log("Cannot read geometry")
      cursor.skip()
      continue
    }

    const geometry = {}

    if (type == GEOMETRY_RIGID) {
      const surfaces = Array.from({ length: cursor.readUint() }, readSurface)
      const vertices = Array.from({ length: surfaces.length }, readVertices)
      Object.assign(geometry, { surfaces, vertices })
    } else {
      const vertices = readVertices()
      const surfaces = Array.from({ length: cursor.readInt() }, readAnimatedSurface)
      Object.assign(geometry, { surfaces, vertices })
    }

    cursor.skip()

    yield { geometry, name, sphere, type }
  }

  function readSurface() {
    const textureID = cursor.readInt()
    const material = cursor.readUint()
    const indices = cursor.buffer(cursor.readUint() * 2)
    const numTextures = (format == 1) ? 0 : cursor.readUint()
    const textures = Array.from({ length: numTextures }, cursor.readString, cursor)

    return { textureID, material, indices, textures }
  }

  function readAnimatedSurface() {
    const textureID = cursor.readInt()
    const material = cursor.readUint()
    const numVertices = cursor.readUint()
    const indices = cursor.buffer(cursor.readUint() * 2)
    const numTextures = (format == 1) ? 0 : cursor.readUint()
    const textures = Array.from({ length: numTextures }, cursor.readString, cursor)

    return { textureID, material, numVertices, indices, textures }
  }

  function readVertices() {
    return cursor.buffer(cursor.readUint() * 36)
  }
}
