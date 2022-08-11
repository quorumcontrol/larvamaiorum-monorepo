import { SoundComponent } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";

@createScript("musicPlayer")
class MusicPlayer extends ScriptTypeBase {

  soundComponent:SoundComponent

  initialize() {
    const component = this.entity.findComponent('sound') as SoundComponent
    if (!component) {
      throw new Error('no sound component')
    }
    this.soundComponent = component
    this.playRandom()
    component.on('end', this.playRandom.bind(this))
  }

  randomSlot() {
    // slots are expected to be named "0", "1", "2", etc
    const randomName = Math.floor(Math.random() * Object.keys(this.soundComponent.slots).length).toString()
    console.log("music slot: ", randomName)
    const slot = this.soundComponent.slot(randomName)
    if (!slot) {
      throw new Error('missing slot on music')
    }
    return slot
  }

  playRandom() {
    this.randomSlot().play()
  }
}

export default MusicPlayer
