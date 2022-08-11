
export default function promiseWaiter(timeToWait:number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeToWait)
  })
}
