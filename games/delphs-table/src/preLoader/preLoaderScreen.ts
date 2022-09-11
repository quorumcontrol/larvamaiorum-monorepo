import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";

@createScript("preLoaderScreen")
class PreLoaderScreen extends ScriptTypeBase {

  initialize() {
    const sceneItem = this.app.scenes.find('ArcticJungle');
  }

}