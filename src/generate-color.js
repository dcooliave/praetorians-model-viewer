export default function *(cursor, length) {
  for (let i = 0; i < length; i++) {
    yield cursor.readUchar()
  }
}
