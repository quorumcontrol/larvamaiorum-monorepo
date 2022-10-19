import { MESSAGE_EVENT } from "../appWide/AppConnector";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";

@createScript("preLoaderScreen")
class PreLoaderScreen extends ScriptTypeBase {

  leftMouseText:string
  rightMouseText:string
  scrollText:string
  clickText:string

  initialize() {
    this.leftMouseText = this.app.touch ? "1 finger" : "left mouse"
    this.rightMouseText = this.app.touch ? "2 fingers" : "right mouse"
    this.scrollText = this.app.touch ? "pinch" : "scroll"
    this.clickText = this.app.touch ? "tap" : "click"

    mustFindByName(this.entity, "DescriptionText").element!.text = this.descriptionText()

    const sceneItem = this.app.scenes.find('DelphsBoard');
    if (!sceneItem) {
      throw new Error('missing scene')
    }
    this.app.scenes.loadSceneData(sceneItem, function (err: any, sceneItem: any) {
      if (err) {
        console.error('error loading scene data', err);
      } else {
        console.log('scene data loaded, listening for setupBoard')
        const handler = (evt:any) => {
          if (!evt.type) {
            return
          }
          if (evt.type === 'setupBoard') {
            console.log('setupBoard received on loading screen, loading scene hierarchy')
            // loadSceneHierarchy and loadSceneSettings is now a synchronous function call as
            // the the scene data has been loaded
            this.app.scenes.loadSceneHierarchy(sceneItem);
            console.log('loading scene settings')
            this.app.scenes.loadSceneSettings(sceneItem);

            // Optional: unload the scene data to free resources
            // this.app.scenes.unloadSceneData(sceneItem);
            console.log('removing listener and disabling')
            this.entity.parent.enabled = false
            this.app.off(MESSAGE_EVENT, handler)
            console.log('refiring evt', evt)
            this.app.fire(MESSAGE_EVENT, evt)
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

  descriptionText() {
    return `
Goal: Harvest gump.
The game is played in rounds. ${this.clickText} to set your destination. Your player moves 1 square per round. If you are on the same square as another player, you battle. Winner gets half the gump. ${this.scrollText} to zoom. ${this.rightMouseText} rotates the camera.
Play cards for buffs. Your game will start soon. Have fun.
    `.trim()
  }
}

export default PreLoaderScreen
