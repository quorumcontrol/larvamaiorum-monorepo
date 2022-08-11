import { Entity, SineOut, Vec3 } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";

import { randomBounded } from "../utils/randoms";

@createScript("randomTrees")
class RandomTrees extends ScriptTypeBase {

  sway = 1
  tree?:Entity

  initialize() {
    if (!this.entity.render) {
      throw new Error('no render')
    }
    if (!this.entity.name.includes('cell')) {
      return
    }
    const tileBoundingBox = this.entity.render.meshInstances[0].aabb;
    const xSize = tileBoundingBox.halfExtents.x;
    const zSize = tileBoundingBox.halfExtents.z;

    const templates = this.app.root.findByName("Templates");
    if (!templates) {
      throw new Error("no templates");
    }
    if (Math.random() > 0.5) {
      const tree = templates.findByName("SingleTree");
      if (!tree) {
        throw new Error("no tree");
      }
      const e = tree.clone() as Entity;
      this.entity.addChild(e);
      e.setLocalScale(0.5, 0.5, 50);
  
      e.setLocalPosition(randomBounded(xSize), 0, randomBounded(zSize));
      this.tree = e
      // this.swayTree() // TODO: make this less jarring
    }
  }

  swayTree() {
    if (!this.tree) {
      return
    }
    const currentRotation = this.tree.getLocalEulerAngles()
    this.tree.tween(currentRotation).rotate(new Vec3(-90,0,Math.max(randomBounded(0.1), 0.05) * this.sway), Math.max(6.0, randomBounded(12.0)), SineOut).on('complete', () => {
      this.sway = this.sway * -1
      setTimeout(() => {
        this.swayTree()
      }, 100)
    }).start()

  }

}

export default RandomTrees
