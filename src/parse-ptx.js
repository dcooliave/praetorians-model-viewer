import generateColor from './generate-color.js'
import BufferCursor from './buffer-cursor.js'

export default function(buffer) {
  const cursor = new BufferCursor(buffer)

  cursor.push()

  const width = cursor.readUint()
  const height = cursor.readUint()
  const bitsPerPixel = cursor.readUint()
  const numComponents = bitsPerPixel / 8
  const numBytes = width * height * numComponents
  const colors = cursor.iterator(generateColor, numBytes)

  cursor.skip()

  return { colors: [...colors], width, height, bitsPerPixel }
}
