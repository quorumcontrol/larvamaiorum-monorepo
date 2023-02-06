import { Room } from "colyseus";
import { Character, LocomotionState, PickleChessState, Tile } from "../rooms/schema/PickleChessState";
import BoardLogic from "./BoardLogic";
import LocomotionLogic from "./LocomotionLogic";

class CharacterLogic {
  state: Character
  private board: BoardLogic
  private locomotion: LocomotionLogic

  private userSetDestination?: Tile

  constructor(state: Character, board: BoardLogic) {
    this.state = state
    this.board = board
    this.locomotion = new LocomotionLogic(state.locomotion, 0.75)
  }

  position() {
    return this.state.locomotion.position
  }

  setDestination(tile: Tile) {
    this.userSetDestination = tile
    console.log("setting destination", tile.x, tile.y, "current: ", this.state.locomotion.position.toJSON())

  }

  update(dt: number) {
    this.locomotion.update(dt)
    if (!this.userSetDestination) {
      return
    }

    const position = this.position()
    const tile = this.board.getTile(position.x, position.z)
    if (!tile) {
      console.error("no tile for ", Math.floor(position.z), Math.floor(position.x))
      return
    }
    if (this.state.tileId !== tile.id) {
      console.log(position.toJSON())
      console.log("character moved to tile", tile.id, "from", this.state.tileId)
    }
    this.state.tileId = tile.id

    if (this.userSetDestination.id === tile.id) {
      this.userSetDestination = undefined
    }

    if (this.locomotion.getState() === LocomotionState.arrived) {
      const path = this.board.findPath(tile, this.userSetDestination, this)
      if (path.length === 0) {
        console.log("no path")
        this.userSetDestination = undefined
        return
      }
      const nextTile = this.board.getTile(path[0][0], path[0][1])

      if (this.board.getOccupent(nextTile.x, nextTile.y)) {
        // if someone is already on this tile, just stop
        this.userSetDestination = undefined
        return
      }

      this.locomotion.setDestinationAndFocus(nextTile.x, nextTile.y)
      this.locomotion.setState(LocomotionState.move)
    }

  }

}

export default CharacterLogic
