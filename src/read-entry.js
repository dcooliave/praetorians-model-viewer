export default function(entry) {
  return new Promise((resolve, reject) => {
    entry.file(file => {
      const reader = new FileReader()
      reader.addEventListener('loadend', () => resolve(reader.result))
      reader.addEventListener('error', e => reject(e))
      reader.readAsArrayBuffer(file)
    }, reject)
  })
}
