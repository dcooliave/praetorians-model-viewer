import generateAnimation from './generate-animation.js'
import generateMesh from './generate-mesh.js'
import generateTexture from './generate-texture.js'
import generateTransform from './generate-transform.js'
import BufferCursor from './buffer-cursor.js'

export default function(buffer) {
  const cursor = new BufferCursor(buffer)

  const format = cursor.readUint()

  cursor.push()

  const name = cursor.readString()

  cursor.push()

  const transforms = cursor.iterator(generateTransform)

  cursor.skip()

  const textures = Array.from(generateTexture(cursor))

  cursor.push()

  const meshes = cursor.iterator(generateMesh)

  cursor.skip()

  cursor.push()

  const animations = cursor.iterator(generateAnimation)

  cursor.skip()

  const parsed = {}

  parsed.name = name
  parsed.format = format
  parsed.textures = textures

  parsed.meshes = [...meshes]
  parsed.transforms = [...transforms]
  parsed.animations = [...animations]

  parsed.meshes.forEach((mesh, meshIndex) => {
    mesh.model = {
      node: null,
      geometry: null,
      materials: [],
      animations: [],
      mixer: null,
      actions: [],
      clips: [],
      name: ''
    }

    for (const animation of parsed.animations) {
      mesh.model.animations.push({
        name: animation.name,
        track: animation.tracks[meshIndex],
        duration: animation.duration
      })
    }
  })

  return parsed
}
