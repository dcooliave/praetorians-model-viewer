export default function *(cursor, length, size) {
  const color = new Uint8Array(size)

  if (size == 4) {
    color[3] = 255
  }

  for (let i = 0; i < length; i += size) {
    color.set(Array.from({ length: size }, cursor.readUchar, cursor))

    const red = color[0]
    color[0] = color[2]
    color[2] = red

    for (const ch of color) {
      yield ch
    }
  }
}
