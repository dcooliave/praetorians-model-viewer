const files = {
  'pba': new Map(),
  'ptx': new Map()
}

function readEntries(reader) {
  return new Promise((resolve, reject) => {
    reader.readEntries(resolve, reject)
  })
}

function readEntry(entry) {
  return new Promise((resolve, reject) => {
    entry.file(file => {
      const reader = new FileReader()
      reader.addEventListener('loadend', () => resolve(reader.result))
      reader.addEventListener('error', reject)
      reader.readAsArrayBuffer(file)
    }, reject)
  })
}

function findEntry(dir) {
  return name => {
    const fname = name.toLowerCase().split('/').pop()
    const ext = fname.slice(fname.lastIndexOf('.') + 1)
    const map = files[ext]

    for (const key of map.keys()) {
      if (!key.startsWith(dir)) continue
      if (!key.endsWith(fname)) continue

      return readEntry(map.get(key))
    }
  }
}

async function readDirectory(reader) {
  let items = await readEntries(reader)
  const files = []

  while (items.length > 0) {
    files.push(...items)
    items = await readEntries(reader)
  }

  return files
}

async function* iterate(items) {
  const queue = []

  for (const item of items) {
    if (item.kind == 'file') {
      queue.push(item.webkitGetAsEntry())
    }
  }

  while (queue.length > 0) {
    const entry = queue.shift()

    if (entry.isDirectory) {
      queue.push(...await readDirectory(entry.createReader()))
    } else if (entry.isFile) {
      yield entry
    }
  }
}

export function directory(path) {
  let dir = path.toLowerCase().split('/')
  dir.pop()

  return findEntry([...dir, ''].join('/'))
}

export async function load(items) {
  const added = []

  for await (const file of iterate(items)) {
    if (file.name[file.name.length - 4] != '.') continue

    const path = file.fullPath.toLowerCase()
    const type = file.name.slice(-3).toLowerCase()
    files[type]?.set(path, file)

    added.push(file)
  }

  return added
}

export default { directory, load }
