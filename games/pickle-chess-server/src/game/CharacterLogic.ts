import { Room } from "colyseus";
import { Character, LocomotionState, PickleChessState, Tile } from "../rooms/schema/PickleChessState";
import LocomotionLogic from "./LocomotionLogic";


class CharacterLogic {
  state: Character
  private room: Room<PickleChessState>
  private locomotion: LocomotionLogic

  constructor(state: Character, room:Room) {
    this.state = state
    this.room = room
    this.locomotion = new LocomotionLogic(state.locomotion, 0.75, room)
  }

  position() {
    return this.state.locomotion.position
  }

  setDestination(tile:Tile) {
    console.log("setting destination", tile.x, tile.y, "current: ", this.state.locomotion.position.toJSON())
    this.locomotion.setDestinationAndFocus(tile.x, tile.y)
    this.locomotion.setState(LocomotionState.move)
  }

  update(dt:number) {
    this.locomotion.update(dt)
  }
  
}

export default CharacterLogic
