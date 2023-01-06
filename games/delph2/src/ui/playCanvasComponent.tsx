import ReactDOM from "react-dom/client"
import { ScriptTypeBase } from "../types/ScriptTypeBase"
import { createScript } from "../utils/createScriptDecorator"
import App from "./App"

@createScript("reactUI")
class ReactUI extends ScriptTypeBase {
  initialize() {
    // create STYLE element
    var style = document.createElement("style")

    // append to head
    document.head.appendChild(style)
    style.innerHTML = `
     #ui-root {
      position: absolute;
      width: 100vw;
      height: 100vh;
      top: 0;
      left: 0;
     }
     `
    const div = document.createElement("div")
    div.id = "ui-root"
    document.body.appendChild(div)
    const root = ReactDOM.createRoot(div)
    const element = <App app={this.app} />
    root.render(element)
    this.entity.on('destroy', () => {
      document.body.removeChild(div);
      document.head.removeChild(style);
    })
  }
}

export default ReactUI
