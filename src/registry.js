const FileRegistry = {
  read(path) {
    return new Promise((resolve, reject) => {
      this.find(path).file(file => {
        const reader = new FileReader()
        reader.addEventListener('loadend', () => resolve(reader.result))
        reader.addEventListener('error', reject)
        reader.readAsArrayBuffer(file)
      }, reject)
    })
  },

  readText(path) {
    return new Promise((resolve, reject) => {
      this.find(path).file(file => {
        const reader = new FileReader()
        reader.addEventListener('loadend', () => resolve(reader.result))
        reader.addEventListener('error', reject)
        reader.readAsText(file)
      }, reject)
    })
  },

  async *iterate(items) {
    const queue = []

    for (const item of items) {
      if (item.kind == 'file') {
        queue.push(item.webkitGetAsEntry())
      }
    }

    while (queue.length > 0) {
      const entry = queue.shift()

      if (entry.isDirectory) {
        queue.push(...await this.readDirectory(entry.createReader()))
      } else if (entry.isFile) {
        yield entry
      }
    }
  },

  async load(items) {
    const added = []

    for await (const file of this.iterate(items)) {
      const i = file.name.lastIndexOf('.')
      if (i == -1) continue

      const path = file.fullPath.toLowerCase()
      const type = file.name.slice(i + 1).toLowerCase()

      if (this.files.has(type)) {
        this.files.get(type).set(path, file)
      } else {
        this.files.set(type, new Map([[path, file]]))
      }

      added.push(file)
    }

    return added
  },

  find(str) {
    const s = str.toLowerCase()
    const map = this.files.get(s.slice(s.lastIndexOf('.') + 1))
    let file

    for (const path of map.keys()) {
      if (path.endsWith(s)) {
        file = map.get(path)
        break
      }
    }

    return file
  },

  entries(reader) {
    return new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject)
    })
  },

  async readDirectory(reader) {
    let items = await this.entries(reader)
    const files = []

    while (items.length > 0) {
      files.push(...items)
      items = await this.entries(reader)
    }

    return files
  }
}

export default {
  files: new Map(),
  ...FileRegistry
}
