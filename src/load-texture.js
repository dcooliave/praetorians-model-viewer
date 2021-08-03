import {
  DataTexture,
  LinearFilter,
  LinearMipMapLinearFilter,
  RepeatWrapping,
  RGBAFormat,
  RGBFormat
} from './three/build/three.module.js'

export default function(data) {
  const texture = new DataTexture(new Uint8Array(data.colors), data.width, data.height)

  texture.magFilter = LinearFilter
  texture.minFilter = LinearMipMapLinearFilter
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.format = (data.bitsPerPixel == 32) ? RGBAFormat : RGBFormat
  texture.generateMipmaps = true

  return texture
}
