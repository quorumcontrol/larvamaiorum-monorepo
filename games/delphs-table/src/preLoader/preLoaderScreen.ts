import { MESSAGE_EVENT } from "../appWide/AppConnector";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";

@createScript("preLoaderScreen")
class PreLoaderScreen extends ScriptTypeBase {

  initialize() {
    const sceneItem = this.app.scenes.find('ArcticJungle');
    if (!sceneItem) {
      throw new Error('missing scene')
    }
    this.app.scenes.loadSceneData(sceneItem, function (err: any, sceneItem: any) {
      if (err) {
        console.error('error loading scene data', err);
      } else {
        console.log('scene data loaded, listening for tableReady')
        const handler = ({ type }: { type: string }) => {
          if (type === 'tableReady') {
            console.log('table ready received')
            console.log('loading scene hierarchy')
            // loadSceneHierarchy and loadSceneSettings is now a synchronous function call as
            // the the scene data has been loaded
            this.app.scenes.loadSceneHierarchy(sceneItem);
            this.app.scenes.loadSceneSettings(sceneItem);

            // Optional: unload the scene data to free resources
            // this.app.scenes.unloadSceneData(sceneItem);
            console.log('removing listner and disabling')
            this.entity.parent.enabled = false
            this.app.off(MESSAGE_EVENT, handler)
          }
        }

        this.app.on(MESSAGE_EVENT, handler)

        console.log("loaded, sending loaded message")
        parent.postMessage(JSON.stringify({
          type: 'loaded',
          data: {},
        }), '*')
      }
    }.bind(this));
  }
}

export default PreLoaderScreen
