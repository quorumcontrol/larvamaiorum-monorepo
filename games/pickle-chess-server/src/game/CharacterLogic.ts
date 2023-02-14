import { Character, LocomotionState, Tile } from "../rooms/schema/PickleChessState";
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

  stop() {
    this.locomotion.stop()
    this.userSetDestination = undefined
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

    // check to see if the destination of the locomotion tile is occupied and if it is then just stop
    const destination = this.locomotion.destination
    if (destination) {
      const destinationTile = this.board.getTile(destination.x, destination.y)
      const occupent = this.board.getOccupent(destinationTile.x, destinationTile.y)
      if (destinationTile && occupent && occupent !== this) {
        console.log("stopping because destination is occupied", destinationTile.id, occupent.state.tileId)
        this.locomotion.stop()
        return
      }
    }

    if (this.locomotion.getState() === LocomotionState.arrived) {
      if (this.userSetDestination.id === tile.id) {
        this.stop()
        return
      }

      const path = this.board.findPath(tile, this.userSetDestination, this)
      if (path.length === 0) {
        console.log("no path")
        this.stop()
        return
      }
      const nextTile = this.board.getTile(path[0][0], path[0][1])

      if (this.board.getOccupent(nextTile.x, nextTile.y)) {
        // if someone is already on this tile, just stop
        this.stop()
        return
      }

      this.locomotion.setDestinationAndFocus(nextTile.x, nextTile.y)
      this.locomotion.setState(LocomotionState.move)
    }

  }

}

export default CharacterLogic
