import {
  DataTexture,
  LinearFilter,
  LinearMipMapLinearFilter,
  RepeatWrapping
} from 'three'

function toRGBA(ptx) {
  const size = ptx.width * ptx.height
  const src = new Uint8Array(ptx.colors)
  const dst = new Uint8Array(size * 4)

  for (let i = 0; i < size; i++) {
    const x1 = i * 4
    const x2 = i * 3

    dst[x1] = src[x2]
    dst[x1 + 1] = src[x2 + 1]
    dst[x1 + 2] = src[x2 + 2]
    dst[x1 + 3] = 255
  }

  return dst
}

export default function(ptx) {
  const image = ptx.bitsPerPixel == 24 ? toRGBA(ptx) : new Uint8Array(ptx.colors)
  const texture = new DataTexture(image, ptx.width, ptx.height)

  texture.magFilter = LinearFilter
  texture.minFilter = LinearMipMapLinearFilter
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.generateMipmaps = true
  texture.needsUpdate = true

  return texture
}
