
class SingletonQueue {
  pending?:Promise<any>

  push(func:()=>Promise<any>):void {
    if (this.pending) {
      this.pending.finally(func).catch((err) => {
        console.error('error in queued singleton queue: ', err)
      })
      return
    }
    this.pending = func().catch((err) => {
      console.error('error in non-queued singleton queue: ', err)
    })
  }

}

export default SingletonQueue
