// TODO

import {
  AmbientLight,
  BoxHelper,
  Clock,
  FileLoader,
  GridHelper,
  Group,
  LoadingManager,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from './three.module.js'

import { MapControls } from './OrbitControls.js'

import generateFile from './generate-file.js'
import readEntry from './read-entry.js'

import loadModel from './load-model.js'
import loadTexture from './load-texture.js'

import parsePBA from './parse-pba.js'
import parsePTX from './parse-ptx.js'

let renderer, scene, camera, light, controls, grid, resizer, clock, node, box
let elementModels, elementGeometries, elementAnimations
let elementBox, elementGrid, elementPlay, elementPause, elementTimeline
let action, currentObject, selectedObject
let pbaMap, ptxMap, timeout

init({
  clearColor: '#1565c0',
  ambientLightColor: '#ffffff',
  showBoxHelper: false,
  boxHelperColor: '#ffff00',
  showGridHelper: true,
  gridHelperSize: 10,
  gridHelperDivision: 30,
  gridHelperCenterColor: '#0d47a1',
  gridHelperLineColor: '#1976d2',
  controlMaxDistace: 500.0,
  controlMinDistace: 5.0,
  controlMaxAngle: 1.0471975511965976,
  controlMinAngle: 0.5235987755982988,
  controlKeypanSpeed: 30.0
})

async function init(config) {
  const container = document.getElementById('scene')
  const canvas = container.querySelector('canvas')
  const clientRect = container.getBoundingClientRect()

  elementModels = document.getElementById('models')
  elementModels.onchange = selectModel

  elementGeometries = document.getElementById('meshes')
  elementGeometries.onchange = selectGeometry

  elementAnimations = document.getElementById('animations')
  elementAnimations.onchange = selectAnimation

  elementBox = document.getElementById('aabb')
  elementBox.onchange = toggleBoundingBox
  elementBox.checked = config.showBoxHelper

  elementGrid = document.getElementById('grid')
  elementGrid.onchange = toggleGrid
  elementGrid.checked = config.showGridHelper

  elementPlay = document.getElementById('play')
  elementPlay.onclick = playAnimation

  elementPause = document.getElementById('pause')
  elementPause.onclick = pauseAnimation

  elementTimeline = document.getElementById('timeline')

  document.body.ondragover = listFiles
  document.body.ondrop = listFiles

  scene = new Scene()
  clock = new Clock()
  node = new Group()
  light = new AmbientLight(config.ambientLightColor, 1.)

  camera = new PerspectiveCamera(45, clientRect.width / clientRect.height, .01, 1000)
  camera.position.x = 6.
  camera.position.y = 6.
  camera.position.z = -6.

  grid = new GridHelper(
    config.gridHelperSize,
    config.gridHelperDivision,
    config.gridHelperCenterColor,
    config.gridHelperLineColor
  )
  grid.visible = config.showGridHelper
  grid.position.y -= .01

  box = new BoxHelper(node, config.boxHelperColor)
  box.visible = config.showBoxHelper

  scene.add(light)
  scene.add(grid)
  scene.add(node)
  scene.add(box)

  renderer = new WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(clientRect.width, clientRect.height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(config.clearColor)

  controls = new MapControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = .1
  controls.rotateSpeed = 1.
  controls.keyPanSpeed = config.controlKeypanSpeed
  controls.minDistance = config.controlMinDistace
  controls.maxDistance = config.controlMaxDistace
  controls.minPolarAngle = config.controlMinAngle
  controls.maxPolarAngle = config.controlMaxAngle

  resizer = new ResizeObserver(debounceCallback(100, resize))
  resizer.observe(container)

  renderer.setAnimationLoop(animate)

  pbaMap = new Map()
  ptxMap = new Map()

  window.renderer = renderer
}

function listFiles(event) {
  event.preventDefault()

  if (event.type == 'drop') {
    addFiles(event.dataTransfer.items)
  }
}

async function addFiles(items) {
  const fragment = new DocumentFragment()

  for await (const file of generateFile(items)) {
    const name = file.name.slice(0, -4)
    const ext = file.name.slice(-4).toLowerCase()

    if (ext == '.pba') {
      if (!pbaMap.has(name)) {
        fragment.appendChild(
          Object.assign(document.createElement('option'), {
            innerText: file.fullPath,
            value: name
          })
        )
      }

      pbaMap.set(name, file)
    } else if (ext == '.ptx') {
      ptxMap.set(name, file)
    }
  }

  elementModels.appendChild(fragment)
}

async function getModel(name) {
  const pbaFile = pbaMap.get(name)

  console.log("Loading", pbaFile.fullPath)

  const pba = parsePBA(await readEntry(pbaFile))

  const textures = await Promise.allSettled(
    pba.textures.map(async (name) => {
      const ptxFile = ptxMap.get(name)

      console.log("Loading", ptxFile.fullPath)

      return parsePTX(await readEntry(ptxFile))
    })
  )

  const ptx = []

  if (!textures.every(result => result.status == 'fulfilled')) {
    console.log("Couldn't load textures")
  } else {
    ptx.push(...textures.map(result => result.value))
  }

  return { pba, ptx }
}

async function selectModel() {
  elementGeometries.innerHTML = ''
  elementAnimations.innerHTML = ''

  const name = elementModels.value
  const model = await getModel(name)

  if (elementModels.value != name) return

  currentObject = loadModel(model.pba, model.ptx.map(loadTexture))

  const fragment = new DocumentFragment()

  for (const mesh of currentObject) {
    fragment.appendChild(
      Object.assign(document.createElement('option'), {
        text: mesh.transformGroup.name
      })
    )
  }

  elementGeometries.appendChild(fragment)
  elementGeometries.selectedIndex = -1
}

function selectGeometry() {
  action?.stop()

  node.remove(...node.children)

  selectedObject?.resources.forEach(obj => obj.dispose())
  selectedObject?.resources.clear()

  selectedObject = currentObject[elementGeometries.selectedIndex]

  node.add(selectedObject.transformGroup)

  box.update()

  const fragment = new DocumentFragment()

  selectedObject.actions?.forEach(action => {
    fragment.appendChild(
      Object.assign(document.createElement('option'), {
        text: action.getClip().name
      })
    )
  })

  elementAnimations.innerHTML = ''
  elementAnimations.appendChild(fragment)
  elementAnimations.selectedIndex = -1

  elementTimeline.value = 0
  elementTimeline.oninput = null
}

function selectAnimation() {
  selectedObject?.actions?.forEach(action => action.stop())

  action = selectedObject.actions?.[elementAnimations.selectedIndex]

  elementTimeline.max = action.getClip().duration
  elementTimeline.value = action.time
  elementTimeline.oninput = changeFrame

  action.play()
}

function toggleBoundingBox() {
  box.visible = elementBox.checked
}

function toggleGrid() {
  grid.visible = elementGrid.checked
}

function playAnimation() {
  selectedObject?.actions?.forEach(action => action.paused = false)
}

function pauseAnimation() {
  selectedObject?.actions?.forEach(action => action.paused = true)
}

function debounceCallback(ms, callback) {
  let timer
  return (...args) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(callback, ms, ...args)
  }
}

function changeFrame() {
  action.time = elementTimeline.valueAsNumber
}

function resize(entries) {
  const { width, height } = entries[0].contentRect

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
}

function animate(time) {
  selectedObject?.mixer?.update(clock.getDelta())

  elementTimeline.value = action?.time ?? 0

  controls.update()
  renderer.render(scene, camera)
}
