import { Room } from "colyseus.js"

// weird setup work just to make sure that playcanvas can parse
// define document and Audio
if (typeof global !== "undefined" && typeof document === "undefined") {
  global.document = {} as Document
  global.Audio = class Audio {  } as any
}

import ReactDOM from "react-dom/client"
import { PickleChessState } from "../syncing/schema/PickleChessState"
import { ScriptTypeBase } from "../types/ScriptTypeBase"
import { createScript } from "../utils/createScriptDecorator"
import App from "./App"

if (typeof global !== "undefined" && typeof document === "undefined") {
  global.document = {} as Document
}

@createScript("reactUI")
class ReactUI extends ScriptTypeBase {
  initialize() {
    this.app.once("newRoom", (room: Room<PickleChessState>) => {
      var style = document.createElement("style")

      // append to head
      document.head.appendChild(style)
      style.innerHTML = `
        #ui-root {
         position: fixed;
         width: 100vw;
         height: 100vh;
         top: 0;
         right: 0;
         pointer-events: none;
        }
        
        #ui-root * {
          pointer-events: auto;
        }
        `
      const div = document.createElement("div")
      div.id = "ui-root"
      // div.addEventListener("contextmenu", (evt) => evt.preventDefault())
      document.body.appendChild(div)
      const root = ReactDOM.createRoot(div)
      const element = <App app={this.app} room={room} />
      root.render(element)
      this.entity.on("destroy", () => {
        root.unmount()
        document.head.removeChild(style)
        document.body.removeChild(div)
      })
    })
  }
}

export default ReactUI
