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
    const indices = Uint16Array.from({ length: cursor.readUint() }, cursor.readUshort, cursor)
    const numTextures = (format == 1) ? 0 : cursor.readUint()
    const textures = Array.from({ length: numTextures }, cursor.readString, cursor)

    return { textureID, material, indices, textures }
  }

  function readAnimatedSurface() {
    const textureID = cursor.readInt()
    const material = cursor.readUint()
    const numVertices = cursor.readUint()
    const indices = Uint16Array.from({ length: cursor.readUint() }, cursor.readUshort, cursor)
    const numTextures = (format == 1) ? 0 : cursor.readUint()
    const textures = Array.from({ length: numTextures }, cursor.readString, cursor)

    return { textureID, material, numVertices, indices, textures }
  }

  function readVertices() {
    const numVertices = cursor.readUint()

    const points = new Float32Array(numVertices * 3)
    const normals = new Float32Array(numVertices * 3)
    const colors = new Uint8Array(numVertices * 4)
    const uv = new Float32Array(numVertices * 2)

    for (let i = 0; i < numVertices; i++) {
      points.set(Array.from({ length: 3 }, cursor.readFloat, cursor), i * 3)
      normals.set(Array.from({ length: 3 }, cursor.readFloat, cursor), i * 3)
      colors.set(Array.from({ length: 4 }, cursor.readUchar, cursor), i * 4)
      uv.set(Array.from({ length: 2 }, cursor.readFloat, cursor), i * 2)
    }

    return { colors, normals, numVertices, points, uv }
  }
}
