function readEntries(reader) {
  return new Promise((resolve, reject) => {
    reader.readEntries(resolve, reject)
  })
}

export default async function(reader) {
  const entries = []
  let items = await readEntries(reader)

  while (items.length > 0) {
    entries.push(...items)
    items = await readEntries(reader)
  }

  return entries
}
