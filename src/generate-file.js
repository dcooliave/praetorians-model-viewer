import readDirectory from './read-directory.js'

export default async function *(entries) {
  const queue = []

  for (const entry of entries) {
    if (entry.kind == 'file') {
      queue.push(entry.webkitGetAsEntry())
    }
  }

  while (queue.length > 0) {
    const entry = queue.shift()

    if (entry.isFile) {
      yield entry
    } else if (entry.isDirectory) {
      queue.push(...await readDirectory(entry.createReader()))
    }
  }
}
