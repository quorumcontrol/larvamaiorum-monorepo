import { Client } from "colyseus";
import { Tile } from "../rooms/schema/PickleChessState";

class TileLogic {
  private state: Tile

  constructor(state: Tile) {
    this.state = state
  }

  handleClick(client:Client) {

  }

}

export default TileLogic
