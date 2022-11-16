import { EventEmitter } from "events"
import { Vec3 } from "playcanvas"

export interface Identity {
  name: string
}

class Syncer extends EventEmitter {
  
  identity:Identity
  nonce = 0

  constructor(id:Identity) {
    super()
    this.identity = id
  }


  playerDestinationChange(newDest:Vec3) {
    this.nonce++
    
  }

}

export default Syncer
