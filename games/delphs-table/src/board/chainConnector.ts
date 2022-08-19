import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import Warrior, { WarriorStats } from "../boardLogic/Warrior";
import Grid from "../boardLogic/Grid";
import BoardGenerate from "./BoardGenerate";
import { GAME_OVER_EVT, NO_MORE_MOVES_EVT, ORCHESTRATOR_TICK, TICK_EVT } from "../utils/rounds";
import { MESSAGE_EVENT } from "../appWide/AppConnector";

const log = console.log; //debug('chainConnector')

interface IFrameRoll {
  index: number,
  random: string,
  destinations: { id: string, x: number, y: number }[]
}

interface SetupMessage { tableId: string, warriors: WarriorStats[], gameLength: number, firstRoll: IFrameRoll }

@createScript("chainConnector")
class ChainConnector extends ScriptTypeBase {
  grid: Grid;

  inProgress?: Promise<any>

  settingUp = false

  latest: number;

  boardGenerate: BoardGenerate

  timeToNextRound = -1;

  initialize() {
    log("chain connector initialized");
    this.handleTick = this.handleTick.bind(this);
    this.asyncHandleTick = this.asyncHandleTick.bind(this);

    const boardGenerate = this.getScript<BoardGenerate>(this.entity, 'boardGenerate')
    if (!boardGenerate) {
      throw new Error('do not use chain connector without boardgenerate')
    }
    this.boardGenerate = boardGenerate
    this.app.on(MESSAGE_EVENT, this.handleIframeEvents, this)
    parent.postMessage(JSON.stringify({
      type: 'gm',
      data: {},
    }), '*')
  }

  update(dt: number) {
    if (this.timeToNextRound > 0) {
      this.timeToNextRound -= dt
      if (this.timeToNextRound < 1) {
        this.timeToNextRound = -1
        this.entity.fire(NO_MORE_MOVES_EVT)
      }
    }
  }

  private handleIframeEvents(evt: any) {
    try {
      switch (evt.type) {
        case 'orchestratorRoll':
          console.log('orchestrator rolled', evt)
          this.handleTick(evt.roll)
          return this.entity.fire(ORCHESTRATOR_TICK)
        case 'noMoreMoves':
          console.log('orchestratored fired no more moves')
          return this.entity.fire(NO_MORE_MOVES_EVT)
        case 'setup':
          console.log('setup event fired')
          this.handleIframeSetup(evt.setup)
        default:
          console.log("EXPECTED unknown msg: ", evt)
      }
    } catch (err) {
      console.error('error handling event', err)
      throw err
    }
  }

  handleIframeSetup({ warriors: warriorStats, firstRoll, gameLength }: SetupMessage) {
    try {
      if (this.settingUp) {
        console.error('setting up called twice')
        return
      }
      this.settingUp = true
      const warriors = warriorStats.map((w) => {
        return new Warrior({
          id: w.id,
          name: w.name,
          attack: w.attack,
          defense: w.defense,
          initialHealth: w.initialHealth,
        });
      });
      log("warriors: ", warriors);
      const grid = new Grid({
        warriors,
        seed: firstRoll.random.toString(),
        sizeX: 10,
        sizeY: 10,
        gameLength,
      });
      this.grid = grid;

      this.boardGenerate.setGrid(grid);
      this.latest = firstRoll.index - 1
      this.grid.start(firstRoll.random);
      this.entity.fire("start");

      this.handleTick(firstRoll)
    } catch (err: any) {
      console.error("error", err);
      throw err;
    }
  }

  private pingParentPage() {
    const warriors = this.grid.warriors.sort((a, b) => {
      return b.wootgumpBalance - a.wootgumpBalance
    }).map((w) => {
      return {
        id: w.id,
        name: w.name,
        currentHealth: w.currentHealth,
        initialHealth: w.initialHealth,
        wootgumpBalance: w.wootgumpBalance,
        attack: w.attack,
        defense: w.defense,
      }
    })
    parent.postMessage(JSON.stringify({
      type: 'gameTick',
      data: warriors,
    }), '*')
  }

  private handleTick(roll: IFrameRoll) {
    if (this.grid.isOver()) {
      return
    }
    log("tick: ", roll.index.toString());
    if (this.inProgress) {
      this.inProgress = this.inProgress.finally(() => {
        return this.asyncHandleTick(roll)
      })
      return
    }
    this.inProgress = this.asyncHandleTick(roll)
  }

  private async asyncHandleTick(
    {
      index,
      random,
      destinations,
    }: IFrameRoll
  ) {
    try {
      log("async tick: ", index.toString());
      if (index !== this.latest + 1) {
        throw new Error('receive out of order event')
      }
 
      console.log('destinations: ', destinations)
      destinations.forEach((dest) => {
        const warrior = this.grid.warriors.find((w) => w.id.toLowerCase() === dest.id.toLowerCase())
        if (!warrior) {
          throw new Error('bad warrior id')
        }
        warrior.setDestination(dest.x, dest.y)
      })
      this.entity.fire(TICK_EVT, this.grid.handleTick(random));
      this.latest = index;
      if (this.grid.isOver()) {
        this.entity.fire(GAME_OVER_EVT)
      }
      this.pingParentPage()
    } catch (err) {
      console.error('error handling async tick: ', err)
      return
    }
  }
}

export default ChainConnector;
