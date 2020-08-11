export default function *(cursor) {
  const numTransforms = cursor.readUint()

  for (let i = 0; i < numTransforms; i++) {
    const name = cursor.readString()
    const parent = cursor.readInt()
    const rotation = Float32Array.from({ length: 4 }, cursor.readFloat, cursor)
    const translation = Float32Array.from({ length: 3 }, cursor.readFloat, cursor)

    yield { name, parent, rotation, translation }
  }
}
