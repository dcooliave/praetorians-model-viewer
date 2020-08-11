export default function *(cursor) {
  const numAnimations = cursor.readUint()

  for (let i = 0; i < numAnimations; i++) {
    cursor.push()

    const name = cursor.readString()
    const duration = cursor.readUint()
    const unknown = cursor.readUint()

    if (unknown != 0) {
      console.log("Cannot read animation sequence")
      cursor.skip()
      continue
    }

    const tracks = Array.from({ length: cursor.readUint() }, readTrack)

    cursor.skip()

    yield { duration, name, tracks }
  }

  function readTrack() {
    cursor.push()

    const unknown = cursor.readUint()
    const numFrames = cursor.readUint()
    const numVertices = cursor.readUint()
    const scalar = Float32Array.from({ length: 6 }, cursor.readFloat, cursor)

    const length = numVertices * 3
    const morphs = new Uint8Array(numFrames * length)
    const times = []

    for (let i = 0; i < numFrames; i++) {
      times.push(cursor.readUint())
      morphs.set(cursor.readChars(length), length * i)
    }

    cursor.skip()

    return { morphs, scalar, times }
  }
}
