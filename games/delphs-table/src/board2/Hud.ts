import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";

@createScript("hud")
class Hud extends ScriptTypeBase {

  initialize() {
    mustFindByName(this.entity, "FullScreenButton").element?.on('click', () => {
      parent.postMessage(JSON.stringify({
        type: 'fullScreenClick',
        data: {},
      }), '*')
    })
    
  }

}

export default Hud
