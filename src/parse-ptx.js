import BufferCursor from './buffer-cursor.js'

export default function(buffer) {
  const cursor = new BufferCursor(buffer)

  cursor.push()

  const width = cursor.readUint()
  const height = cursor.readUint()
  const bitsPerPixel = cursor.readUint()
  const numComponents = bitsPerPixel / 8
  const colors = cursor.buffer(width * height * numComponents)

  cursor.skip()

  return { colors, width, height, bitsPerPixel }
}
