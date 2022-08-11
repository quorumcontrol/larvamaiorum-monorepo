import { Entity, GraphNode, SoundComponent, Tween } from "playcanvas";
import Battle from "../boardLogic/Battle";
import Cell from "../boardLogic/Cell";
import Warrior from "../boardLogic/Warrior";
import Wootgump from "../boardLogic/Wootgump";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { getGameConfig } from "../utils/config";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { randomBounded } from "../utils/randoms";
import { TICK_EVT } from "../utils/rounds";
import BattleUI from "./BattleUI";
import PlayerMarker from "./PlayerMarker";

@createScript("cellState")
class CellState extends ScriptTypeBase {
  xSize: number;
  zSize: number;
  playerMarkerTemplate: GraphNode;
  wootGumpTemplate: GraphNode;
  battleTemplate: GraphNode;
  destinationTemplate: Entity;
  soundComponent: SoundComponent

  destinationElement?: Entity; // keep track of it to delete if the destination changes
  destinationTween?:Tween

  cell?: Cell;
  playerMarkers: { [key: string]: Entity };
  gumps: { [key: string]: Entity };
  battles: { [key: string]: Entity };

  initialize() {
    this.handleTick = this.handleTick.bind(this);
    if (!this.entity.render) {
      throw new Error("no render");
    }
    const tileBoundingBox = this.entity.render.meshInstances[0].aabb;
    this.xSize = tileBoundingBox.halfExtents.x * 0.8;
    this.zSize = tileBoundingBox.halfExtents.z * 0.8;

    const templates = mustFindByName(this.app.root, "Templates");
    this.playerMarkerTemplate = mustFindByName(templates, "PlayerMarker");
    this.wootGumpTemplate = mustFindByName(templates, "Wootgump");
    this.battleTemplate = mustFindByName(templates, "Battle");
    this.destinationTemplate = mustFindByName(templates, "DestinationMarker");
    this.soundComponent = mustFindByName(this.entity, 'Announcer').findComponent('sound')  as SoundComponent

    this.playerMarkers = {};
    this.gumps = {};
    this.battles = {};
    this.entity.parent.on(TICK_EVT, this.handleTick);
  }

  handleTick() {
    this.stateUpdate();
  }

  update() {
    this.handleMaybeDestinationTile();
  }

  setCell(cell: Cell) {
    this.cell = cell;
    this.stateUpdate();
  }

  stateUpdate() {
    if (!this.cell) {
      throw new Error("no cell assigned");
    }
    this.updateWarriors();
    this.updateGump();
    this.updateBattles();
  }

  private handleMaybeDestinationTile() {
    const gameConfig = getGameConfig(this.app.root);
    if (!gameConfig.currentPlayer || !this.cell || !(gameConfig.currentPlayer.destination || gameConfig.currentPlayer.pendingDestination)) {
      return;
    }

    const pendingDest = gameConfig.currentPlayer.pendingDestination
    const dest = gameConfig.currentPlayer.destination

    const currentPlayerDest = (pendingDest || dest)!

    if (
      currentPlayerDest[0] == this.cell.x &&
      currentPlayerDest[1] == this.cell.y
    ) {
      if (!this.destinationElement) {
        console.log('current player dest: ', currentPlayerDest)
        console.log(this.cell.x, this.cell.y, 'setting destination element')
        this.destinationElement = this.destinationTemplate.clone() as Entity;
        this.entity.addChild(this.destinationElement);
        const rndX = randomBounded(this.xSize * 0.5);
        const rndZ = randomBounded(this.zSize * 0.5);
        this.destinationElement.setLocalScale(1, 20, 1);
        this.destinationElement.setLocalPosition(rndX, 4, rndZ);
        if (pendingDest) {
          console.log('tweening pendingDest')
          this.destinationTween = this.destinationElement.tween(this.destinationElement.getLocalPosition()).to({ x: rndX, y: 12, z: rndZ }, 1.0, pc.SineOut).yoyo(true).loop(true).start()
        }
      }

      if (!pendingDest && this.destinationTween) {
        this.destinationTween.stop()
        this.destinationTween = undefined
        const currentPosition = this.destinationElement.getLocalPosition()
        this.destinationElement.setLocalPosition(currentPosition.x, 4, currentPosition.z)
      }

      return;
    }

    if (this.destinationElement) {
      this.destinationElement.destroy();
      this.destinationElement = undefined;
    }
  }

  private updateBattles() {
    if (!this.cell) {
      throw new Error("trying to update cellSTate with no cell");
    }
    const cellIds = this.cell.battles.map((b) => b.battleId());
    const uiIds = Object.keys(this.battles);
    // first delete anything that's not there anymore
    uiIds
      .filter((id) => !cellIds.includes(id))
      .forEach((id) => {
        try {
          if (this.battles[id]) {
            const battleUIScript = this.getScript<BattleUI>(this.battles[id], "battleUI");
            battleUIScript?.destroy();
            delete this.battles[id];
          }
        } catch (err) {
          console.error("error: ", err);
          throw err;
        }
      });
    this.cell.battles.forEach((battle) => {
      if (!this.battles[battle.battleId()]) {
        this.placeBattle(battle);
      }
    });
  }

  private placeBattle(battle: Battle) {
    const battleElement = this.battleTemplate.clone();
    this.entity.addChild(battleElement);

    const rndX = randomBounded(this.xSize * 0.5);
    const rndZ = randomBounded(this.zSize * 0.5);
    battleElement.setLocalScale(0.4, 0.4, 0.4);

    battleElement.setLocalPosition(rndX, 0.5, rndZ);
    battleElement.setRotation(0, randomBounded(0.2), 0, 1);
    this.battles[battle.battleId()] = battleElement as Entity;
    const battleUIScript = this.getScript<BattleUI>(battleElement as Entity, "battleUI");
    battleUIScript?.setBattle(battle);
  }

  private updateWarriors() {
    if (!this.cell) {
      throw new Error("trying to update cellSTate with no cell");
    }
    const warriorsToShow = this.cell.nonBattlingWarriors().concat(this.cell.deadWarriors())

    const cellIds = warriorsToShow.map((w) => w.id);
    const uiIds = Object.keys(this.playerMarkers);
    // first delete anything that's not there anymore
    uiIds
      .filter((id) => !cellIds.includes(id))
      .forEach((id) => {
        try {
          if (this.playerMarkers[id]) {
            this.playerMarkers[id].destroy();
            delete this.playerMarkers[id];
          }
        } catch (err) {
          console.error("error: ", err);
          throw err;
        }
      });

    // warriorsToShow.forEach((warrior) => {
    //   try {
    //     if (!this.playerMarkers[warrior.id]) {
    //       this.placeWarrior(warrior);
    //     }
    //   } catch (err) {
    //     console.error("err: ", err);
    //     throw err;
    //   }
    // });
  }

  private destroyGump(id:string) {
    const gump = this.gumps[id]
    const start = gump.getLocalPosition()
    gump.tween(start).to({x: start.x, y: start.y + 200, z: start.z}, 2.0).on('complete', () => {
      gump.destroy()
    }).start()

    const gameConfig = getGameConfig(this.app.root);
    if (!this.cell || !gameConfig.currentPlayer) {
      return
    }
    if (this.cell.nonBattlingWarriors().includes(gameConfig.currentPlayer)) {
      this.soundComponent.slots['Harvest'].play()
    }
  }

  private updateGump() {
    if (!this.cell) {
      throw new Error("trying to update cellSTate with no cell");
    }
    const cellIds = this.cell.wootgump.map((w) => w.id);
    const uiIds = Object.keys(this.gumps);
    // first delete anything that's not there anymore
    uiIds
      .filter((id) => !cellIds.includes(id))
      .forEach((id) => {
        try {
          this.destroyGump(id);
          delete this.gumps[id];
        } catch (err) {
          console.error("error: ", err);
          throw err;
        }
      });

    this.cell.wootgump.forEach((gump) => {
      try {
        if (!this.gumps[gump.id]) {
          this.placeGump(gump);
        }
      } catch (err) {
        console.error("err: ", err);
        throw err;
      }
    });
  }

  private placeGump(wootGump: Wootgump) {
    const gumpElement = this.wootGumpTemplate.clone();
    this.entity.addChild(gumpElement);

    const rndX = randomBounded(this.xSize);
    const rndZ = randomBounded(this.zSize);
    gumpElement.setLocalScale(0.1, 10, 0.1);

    gumpElement.setLocalPosition(rndX, 0, rndZ);
    gumpElement.setRotation(0, randomBounded(0.2), 0, 1);
    this.gumps[wootGump.id] = gumpElement as Entity;
  }

  // private placeWarrior(warrior: Warrior) {
  //   const playerMarker = this.playerMarkerTemplate.clone();
  //   playerMarker.name = `${this.cell?.x}-${this.cell?.y}-marker-${warrior.id}`;

  //   this.entity.addChild(playerMarker);
  //   this.getScript<PlayerMarker>(playerMarker as Entity, "playerMarker")?.setWarrior(
  //     warrior
  //   );

  //   playerMarker.setLocalScale(0.05, 5, 0.05);
  //   const rndX = randomBounded(this.xSize);
  //   const rndZ = randomBounded(this.zSize);

  //   playerMarker.setLocalPosition(rndX, 22.5, rndZ);
  //   playerMarker.setRotation(0, randomBounded(0.2), 0, 1);
  //   this.playerMarkers[warrior.id] = playerMarker as Entity;
  //   return playerMarker;
  // }
}

export default CellState;
