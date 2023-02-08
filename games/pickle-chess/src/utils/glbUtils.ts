
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
export function loadGlbContainerFromUrl(app: pc.Application, url: string, options: any, assetName: string, callback: (err: any, asset: pc.Asset) => any) {
  console.log("load glb from container, ", url, assetName)
  var filename = assetName + '.glb';
  var file = {
    url: url,
    filename: filename
  };

  let finished = false

  const onLoaded = (containerAsset: pc.Asset) => {
    console.log("asset once called")
    if (finished) {
      console.error("asset once was called multiple times, but we're ignoring it")
      return
    }
    finished = true
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
  }

  // see if the asset already exists and if so, just return it when ready
  let asset = app.assets.find(filename);
  if (asset) {
    if (asset.resource) {
      onLoaded(asset);
    } else {
      asset.once('load', onLoaded);
    }
    return asset;
  }

  asset = new pc.Asset(filename, 'container', file, undefined, options);

  asset.once('load', onLoaded)

  app.assets.add(asset);
  app.assets.load(asset);

  return asset;
};