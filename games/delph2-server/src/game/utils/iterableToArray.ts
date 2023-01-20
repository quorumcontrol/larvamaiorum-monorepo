
function iterableToArray<T>(iterable: IterableIterator<T>) {
  return Array.from(iterable)
  // let arry:T[] = []
  // for (const val of iterable) {
  //   arry.push(val)
  // }
  // return arry
}

export default iterableToArray
