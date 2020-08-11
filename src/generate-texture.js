export default function *(cursor) {
  const numTextures = cursor.readUint()

  for (var i = 0; i < numTextures; i++) {
    yield cursor.readString()
  }
}
