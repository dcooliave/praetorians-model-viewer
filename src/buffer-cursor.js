export default class BufferCursor {
  position = 0
  blocks = []

  constructor(buffer, byteOffset = 0) {
    this.data = new DataView(buffer, byteOffset)
  }

  seek(offset) {
    return this.position = offset
  }

  peek() {
    return this.position
  }

  push() {
    const offset = this.peek()
    const id = this.readUshort()
    const byteLength = this.readUint()

    return this.blocks.push({ id, byteLength, offset })
  }

  skip() {
    const block = this.blocks[this.blocks.length - 1]
    this.seek(block.offset + block.byteLength)

    return block
  }

  iterator(generator, ...args) {
    const start = this.position

    return {
      [Symbol.iterator]: () => {
        return generator(new BufferCursor(this.data.buffer, start), ...args)
      }
    }
  }

  buffer(size) {
    const offset = this.data.byteOffset + this.position
    const buffer = this.data.buffer.slice(offset, offset + size)
    this.position += size

    return buffer
  }

  readUchar() {
    const value = this.data.getUint8(this.position, true)
    this.position += 1

    return value
  }

  readShort() {
    const value = this.data.getInt16(this.position, true)
    this.position += 2

    return value
  }

  readUshort() {
    const value = this.data.getUint16(this.position, true)
    this.position += 2

    return value
  }

  readInt() {
    const value = this.data.getInt32(this.position, true)
    this.position += 4

    return value
  }

  readUint() {
    const value = this.data.getUint32(this.position, true)
    this.position += 4

    return value
  }

  readFloat() {
    const value = this.data.getFloat32(this.position, true)
    this.position += 4

    return value
  }

  readChars(size) {
    const value = new Uint8Array(this.data.buffer, this.data.byteOffset + this.position, size)
    this.position += size

    return value
  }

  readString() {
    const chars = this.readChars(32)
    let string = ''

    for (let ch of chars) {
      if (ch == 0x00) break
      string += String.fromCharCode(ch)
    }

    return string
  }
}
