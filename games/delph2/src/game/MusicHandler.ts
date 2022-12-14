import { Music } from "../syncing/schema/DelphsTableState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";

@createScript("musicHandler")
class MusicHandler extends ScriptTypeBase {

  existing?: HTMLAudioElement
  started: boolean

  initialize() {
    this.app.on("musicVolumeUp", this.volumeUp, this)
    this.app.on("musicVolumeDown", this.volumeDown, this)
  }

  update() {
    if (!this.existing) {
      return
    }
    //TODO: make these UI controls
    if (this.app.keyboard.wasPressed(pc.KEY_ADD)) {
      this.volumeUp()
    }
    if (this.app.keyboard.wasPressed(pc.KEY_SUBTRACT)) {
      this.volumeDown()
    }
  }

  start() {
    if (this.started) {
      return
    }
    this.started = true
    if (this.existing) {
      this.existing.play()
    }
  }

  volumeDown() {
    if (!this.existing) {
      return
    }
    this.existing.volume = this.existing.volume * 0.9
  }

  volumeUp() {
    if (!this.existing) {
      return
    }
    this.existing.volume = this.existing.volume * 1.1
  }

  setMusic(music:Music) {
    const audio = new Audio(music.url)
    audio.volume = 0.05
    if (this.existing) {
      this.existing.pause()
      this.existing.remove()
    }
    (window as any).music = audio
    this.existing = audio
    if (this.started) {
      audio.play()
    }
    // var soundAsset = new pc.Asset(`${music.name}.mp3`, "audio", { url: music.url }); 
    // this.app.assets.add(soundAsset);
    // const onAssetLoad = (assetId:number) => 
    // {
    //     console.log("loaded track: ", music.name)
    //     this.entity.sound!.addSlot(music.name, {
    //         loop: false,
    //         autoPlay: true,
    //         asset: assetId
    //     });
    // };

    // soundAsset.once('load', onAssetLoad); 
    // this.app.assets.load(soundAsset);
  }

}

export default MusicHandler
