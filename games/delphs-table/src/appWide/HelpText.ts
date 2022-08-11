import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";

@createScript("helpText")
class HelpText extends ScriptTypeBase {

  initialize() {
    this.handleCloseClick = this.handleCloseClick.bind(this)
    mustFindByName(this.entity, 'CloseButton').button?.on('click', this.handleCloseClick)
  }

  handleCloseClick() {
    this.entity.enabled = false
  }

  show() {
    this.entity.enabled = true
  }

}

export default HelpText
