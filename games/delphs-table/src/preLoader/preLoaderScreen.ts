import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";

@createScript("preLoaderScreen")
class PreLoaderScreen extends ScriptTypeBase {

  initialize() {
    const sceneItem = this.app.scenes.find('ArcticJungle');
    if (!sceneItem) {
      throw new Error('missing scene')
    }
    this.app.scenes.loadSceneData(sceneItem, function (err:any, sceneItem:any) {
      if (err) {
          console.error(err);
      } else {
        console.log("loaded, sending loaded message")
        parent.postMessage(JSON.stringify({
          type: 'loaded',
          data: {},
        }), '*')
          // // Destroy all children under application root to remove the current loaded scene hierarchy
          // var rootChildren = this.app.root.children;
          // while(rootChildren.length > 0) {
          //     rootChildren[0].destroy();
          // }
  
          // // loadSceneHierarchy and loadSceneSettings is now a synchronous function call as
          // // the the scene data has been loaded
          // this.app.scenes.loadSceneHierarchy(sceneItem);
          // this.app.scenes.loadSceneSettings(sceneItem);
  
          // // Optional: unload the scene data to free resources
          // this.app.scenes.unloadSceneData(sceneItem);
      }
  }.bind(this));
  }
}

export default PreLoaderScreen
