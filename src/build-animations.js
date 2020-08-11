import { AnimationClip, BufferAttribute, Vector3 } from './three.module.js'
import { GEOMETRY_ANIMATED } from './types.js'

function scaleVertices(track) {
  const vector = new Vector3()
  const vertices = new Float32Array(track.morphs.length)
  const factor = new Vector3().fromArray(track.scalar, 3)

  factor.sub(new Vector3().fromArray(track.scalar)).divideScalar(255)

  for (let i = 0, n = vertices.length / 3; i < n; i++) {
    const stride = i * 3
    vector.fromArray(track.morphs, stride).multiply(factor)
    vertices.set(vector.toArray(), stride)
  }

  return vertices
}

function buildMorphTargets(animation) {
  const targets = []

  const vertices = scaleVertices(animation.track)
  const length = animation.track.morphs.length / animation.track.times.length

  for (const [i, time] of animation.track.times.entries()) {
    const morph = vertices.subarray(i * length, (i + 1) * length)
    const target = new BufferAttribute(morph, 3)
    target.name = `${animation.name}_${i}`
    targets.push(target)
  }

  return targets
}

export default function(mesh) {
  if (mesh.type == GEOMETRY_ANIMATED) {
    const positions = []

    for (const animation of mesh.model.animations) {
      const morphTargets = buildMorphTargets(animation)

      mesh.model.clips.push(
        AnimationClip.CreateFromMorphTargetSequence(animation.name, morphTargets, 24)
      )

      positions.push(...morphTargets)
    }

    mesh.model.geometry.morphAttributes.position = positions
  }
}
