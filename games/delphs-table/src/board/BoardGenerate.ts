import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import Grid from "../boardLogic/Grid";
import Cell from "../boardLogic/Cell";
import { Entity } from "playcanvas";
import CellState from "./CellState";
import { GameConfig } from "../utils/config";
import { UI_FOCUS_REQUEST } from "../appWide/Focuser";
import Warrior from "../boardLogic/Warrior";
import mustFindByName from "../utils/mustFindByName";
import PlayerMarker from "./PlayerMarker";
import { MESSAGE_EVENT } from "../appWide/AppConnector";
import { NO_MORE_MOVES_EVT, ORCHESTRATOR_TICK } from "../utils/rounds";

@createScript("boardGenerate")
class BoardGenerate extends ScriptTypeBase {
  currentPlayer = "";

  ground: Entity;
  playerMarkerTemplate: Entity
  grid?: Grid;

  timer = 0;

  started = false;

  next:(()=>any)[]

  initialize() {
    this.initialCellSetup = this.initialCellSetup.bind(this);
    this.onStart = this.onStart.bind(this);
    const templates = mustFindByName(this.app.root, "Templates");
    this.playerMarkerTemplate = mustFindByName(templates, "PlayerMarker");
    this.ground = mustFindByName(templates, "Tile")

    this.entity.on("start", this.onStart);
    const urlParams = new URLSearchParams(window.location.search);
    this.currentPlayer = urlParams.get("player") || "";
    console.log('current player: ', this.currentPlayer)
    this.next = []
    this.app.on(MESSAGE_EVENT, this.handleExternalEvents, this)
  }

  update() {
    if (this.next.length > 0) {
      this.next.forEach((func) => {
        func()
      })
      this.next = []
    }
    if (this.app.keyboard.wasPressed(pc.KEY_P)) {
      this.focusOnPlayerCell()
    }
  }

  private handleExternalEvents(evt:any) {
    try {
      switch (evt.type) {
        case 'orchestratorRoll':
          console.log('orchestrator rolled')
          return this.entity.fire(ORCHESTRATOR_TICK)
        case 'noMoreMoves':
          console.log('orchestratored fired no more moves')
          return this.entity.fire(NO_MORE_MOVES_EVT)
      }
    } catch(err) {
      console.error('error handling event', err)
      throw err
    }
  }

  setGrid(grid: Grid) {
    this.grid = grid;
    console.log("set grid: ", this.grid);
    this.grid.everyCell(this.initialCellSetup);
    this.focusOnPlayerCell()
  }

  onStart() {
    if (!this.grid) {
      throw new Error("no grid");
    }

    this.grid.warriors.forEach((warrior) => {
      this.initialWarriorSetup(warrior)
    })
    this.focusOnPlayerCell()
  }

  focusOnPlayerCell() {
    const config = this.getGameConfig()
    const location = config.currentPlayer?.location
    if (location) {
      console.log('focusing camera on player')
      
      const cellEntity = this.entity.findByName(location.id)
      this.next.push(() => {
        this.app.fire(UI_FOCUS_REQUEST, cellEntity)
      })
      return
    }
    // if no current player or no location, then lets see the whole board
    this.next.push(() => {
      this.app.fire(UI_FOCUS_REQUEST, this.entity)
    })
  }

  getGameConfig(): GameConfig {
    return {
      currentPlayer: this.grid?.warriors?.find((w) => w.id.toLowerCase() === this.currentPlayer.toLowerCase()),
      grid: this.grid,
      controller: this.entity,
    };
  }

  private initialWarriorSetup(warrior: Warrior) {
    if (!this.grid) {
      throw new Error("no grid");
    }
    try {
      const marker = this.playerMarkerTemplate.clone() as Entity;
      const markerScript = this.getScript<PlayerMarker>(marker, "playerMarker");
      if (!markerScript) {
        throw new Error("no script");
      }

      marker.name = `warrior-${warrior.id}`

      this.entity.addChild(marker)
      markerScript?.setWarrior(warrior);
    } catch (err) {
      console.error("error initial warrior: ", err);

      throw err;
    }
  }

  private initialCellSetup(cell: Cell) {
    if (!this.grid) {
      throw new Error("no grid");
    }
    try {
      const e = this.ground.clone();
      const cellStateScript = this.getScript<CellState>(e as Entity, "cellState");
      if (!cellStateScript) {
        throw new Error("no script");
      }
      // Set the world position of the cloned tile. Note that because
      // our tiles are 10x10 in X,Z dimensions, we have to multiply
      // the position by 10
      e.setPosition(
        (cell.x - this.grid.sizeX / 2) * 1.01,
        0.6,
        (cell.y - this.grid.sizeY / 2) * 1.01
      );
      e.name = cell.id
      this.entity.addChild(e);
      cellStateScript?.setCell(cell);
    } catch (err) {
      console.error("error initial cell: ", err);
      throw err;
    }
  }
}

export default BoardGenerate;
