import { Vec2 } from "playcanvas"
import { Vec2 as StateVec2 } from "../syncing/schema/DelphsTableState"

const vec2ToVec2 = (stateVec2:StateVec2) => {
  return new Vec2(stateVec2.x, stateVec2.z)
}

export default vec2ToVec2
