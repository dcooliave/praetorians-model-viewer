import {
  DataTexture,
  LinearFilter,
  RepeatWrapping,
  RGBAFormat,
  RGBFormat
} from './three.module.js'

export default function(data) {
  const texture = new DataTexture(Uint8Array.from(data.colors), data.width, data.height)

  texture.magFilter = LinearFilter
  texture.minFilter = LinearFilter
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.format = (data.bitsPerPixel == 32) ? RGBAFormat : RGBFormat

  return texture
}
