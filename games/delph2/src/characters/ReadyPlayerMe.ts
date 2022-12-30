import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import { loadGlbContainerFromUrl } from "../utils/glbUtils";
import mustFindByName from "../utils/mustFindByName";

const avatar = "https://api.readyplayer.me/v1/avatars/63a18daedf6a9ef0482c8579.glb?quality=low"

@createScript("readyPlayerMe")
class ReadyPlayerMe extends ScriptTypeBase {

  initialize() {
    this.loadGLBModelFromURL(avatar)
  }

  loadGLBModelFromURL(modelURL:string) {
    let name = "model_" + (Math.floor(Math.random() * 10000));
    let cacheURL = modelURL + "&cacheBuster=" + (Math.floor(Math.random() * 10000));

    const axe = mustFindByName(this.app.root, "Axe").clone()
    const shield = mustFindByName(this.app.root, "Shield").clone()

    loadGlbContainerFromUrl(this.app, cacheURL, null, name, (err:any, asset:pc.Asset) => {
      console.log("loaded: ", err, asset)
      var renderRootEntity = asset.resource.instantiateRenderEntity();
      console.log("renderRoot:", renderRootEntity)
      this.entity.addChild(renderRootEntity);
      // this.entity.anim!.rootBone = this.entity
      this.entity.anim!.activate = true
      this.entity.anim!.reset()

      mustFindByName(this.entity, "RightHand").addChild(axe)
      mustFindByName(this.entity, "LeftForeArm").addChild(shield)
    });
};

}

export default ReadyPlayerMe;
