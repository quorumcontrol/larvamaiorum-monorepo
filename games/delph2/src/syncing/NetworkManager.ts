import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

@createScript("networkManager")
class NetworkManager extends ScriptTypeBase {

  // room?: Room

  async initialize() {
    // this.room = await client.joinOrCreate("my_room");
  }

}