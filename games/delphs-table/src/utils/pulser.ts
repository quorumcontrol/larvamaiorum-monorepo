import { Entity } from "playcanvas"

const pulser = (entity: Entity, height:number, time:number) => {
  const starting = entity.getLocalPosition()
  const dest = {x: starting.x, y: starting.y + height, z: starting.z}
  return entity.tween(starting).to(dest, time, pc.SineInOut).yoyo(true).loop(true).start()
}

export default pulser
