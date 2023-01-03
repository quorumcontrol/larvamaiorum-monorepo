
function iterableToArray<T>(iterable: IterableIterator<T>) {
  let arry:T[] = []
  for (const val of iterable) {
    arry.push(val)
  }
  return arry
}

export default iterableToArray
