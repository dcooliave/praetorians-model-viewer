import buildAnimations from './build-animations.js'
import buildGeometry from './build-geometry.js'
import buildMaterials from './build-materials.js'
import buildMesh from './build-mesh.js'
import buildMixer from './build-mixer.js'

export default function(pba, ptx) {
  const transforms = pba.transforms
  const meshes = []

  for (const mesh of pba.meshes) {
    buildMaterials(mesh, ptx)
    buildGeometry(mesh)
    buildAnimations(mesh)
    buildMesh(mesh, transforms)
    buildMixer(mesh)

    meshes.push({
      transformGroup: mesh.model.node,
      actions: mesh.model.actions,
      mixer: mesh.model.mixer,
      resources: mesh.model.resources
    })
  }

  return meshes
}
