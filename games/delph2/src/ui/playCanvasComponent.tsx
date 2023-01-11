import { Room } from "colyseus.js"
import ReactDOM from "react-dom/client"
import { DelphsTableState } from "../syncing/schema/DelphsTableState"
import { ScriptTypeBase } from "../types/ScriptTypeBase"
import { createScript } from "../utils/createScriptDecorator"
import App from "./App"

@createScript("reactUI")
class ReactUI extends ScriptTypeBase {
  initialize() {
   this.app.once("newRoom", (room:Room<DelphsTableState>) => {
     // create STYLE element
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
      }
      `
     const div = document.createElement("div")
     div.id = "ui-root"
     div.addEventListener("contextmenu", (evt) => evt.preventDefault())
     document.body.appendChild(div)
     const root = ReactDOM.createRoot(div)
     const element = <App app={this.app} room={room} />
     root.render(element)
     this.entity.on('destroy', () => {
       root.unmount(); 
       document.body.removeChild(div);
       document.head.removeChild(style);
     })
   })
  }
}

export default ReactUI
