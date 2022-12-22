import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
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

    this.loadGlbContainerFromUrl(cacheURL, null, name, (err:any, asset:pc.Asset) => {
      console.log("loaded: ", err, asset)
      var renderRootEntity = asset.resource.instantiateRenderEntity();
      console.log("renderRoot:", renderRootEntity)
      this.entity.addChild(renderRootEntity);
      this.entity.anim!.rootBone = this.entity
      this.entity.anim!.activate = true
      this.entity.anim!.reset()

      mustFindByName(this.entity, "RightHand").addChild(axe)
      mustFindByName(this.entity, "LeftForeArm").addChild(shield)
    });
};

/**
     * @name utils#loadGlbContainerFromUrl
     * @function
     * @description Load a GLB container from a URL that returns a `model/gltf-binary` as a GLB.
     * @param {String} url The URL for the GLB
     * @param {Object} options Optional. Extra options to do extra processing on the GLB.
     * @param {String} assetName. Name of the asset.
     * @param {Function} callback The callback function for loading the asset. Signature is `function(string:error, asset:containerAsset)`.
     * If `error` is null, then the load is successful.
     * @returns {pc.Asset} The asset that is created for the container resource.
     */
loadGlbContainerFromUrl(url:string, options:any, assetName:string, callback:(err:any, asset:pc.Asset)=>any) {
  var filename = assetName + '.glb';
  var file = {
      url: url,
      filename: filename
  };

  var asset = new pc.Asset(filename, 'container', file, undefined, options);
  asset.once('load', function (containerAsset:pc.Asset) {
      if (callback) {
          // As we play animations by name, if we have only one animation, keep it the same name as
          // the original container otherwise, postfix it with a number
          var animations = containerAsset.resource.animations;
          if (animations.length == 1) {
              animations[0].name = assetName;
          } else if (animations.length > 1) {
              for (var i = 0; i < animations.length; ++i) {
                  animations[i].name = assetName + ' ' + i.toString();
              }
          }

          callback(null, containerAsset);
      }
  });

  this.app.assets.add(asset);
  this.app.assets.load(asset);

  return asset;
};

}

export default ReadyPlayerMe;
