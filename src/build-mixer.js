import { AnimationMixer } from './three/build/three.module.js'
import { GEOMETRY_ANIMATED } from './types.js'

export default function(mesh) {
  if (mesh.type == GEOMETRY_ANIMATED) {
    mesh.model.mixer = new AnimationMixer(mesh.model.node)

    for (const animation of mesh.model.animations) {
      const action = mesh.model.mixer.clipAction(animation.name)
      action.setDuration(animation.duration / 1000)

      mesh.model.actions.push(action)
    }
  }
}
