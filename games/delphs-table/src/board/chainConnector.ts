import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import Warrior, { WarriorStats } from "../boardLogic/Warrior";
import Grid, { TickOutput } from "../boardLogic/Grid";
import BoardGenerate from "./BoardGenerate";
import { GAME_OVER_EVT, NO_MORE_MOVES_EVT, ORCHESTRATOR_TICK, TICK_EVT } from "../utils/rounds";
import { MESSAGE_EVENT } from "../appWide/AppConnector";
import SimpleSyncher from "../utils/singletonQueue";
import debug from 'debug'

const log = debug('chainConnector')

interface IFrameRoll {
  index: number,
  random: string,
  destinations: { id: string, x: number, y: number }[]
}

interface SetupMessage {
  tableId: string,
  warriors: WarriorStats[],
  gameLength: number,
  firstRoll: IFrameRoll,
  wootgumpMultipler: number,
  tableSize: number, 
}

@createScript("chainConnector")
class ChainConnector extends ScriptTypeBase {
  grid: Grid;

  settingUp = false

  latest: number;

  boardGenerate: BoardGenerate

  timeToNextRound = -1;

  singleton: SimpleSyncher

  initialize() {
    this.singleton = new SimpleSyncher('chainConnector')
    log("chain connector initialized");
    this.handleTick = this.handleTick.bind(this);
    this.asyncHandleTick = this.asyncHandleTick.bind(this);

    const boardGenerate = this.getScript<BoardGenerate>(this.entity, 'boardGenerate')
    if (!boardGenerate) {
      throw new Error('do not use chain connector without boardgenerate')
    }
    this.boardGenerate = boardGenerate
    this.app.on(MESSAGE_EVENT, this.handleIframeEvents, this)
    console.log('sending gm')
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
          log('orchestrator rolled', evt)
          this.handleTick(evt.roll)
          return this.entity.fire(ORCHESTRATOR_TICK)
        case 'noMoreMoves':
          log('orchestratored fired no more moves')
          return this.entity.fire(NO_MORE_MOVES_EVT)
        case 'setup':
          log('setup event fired')
          this.handleIframeSetup(evt.setup)
        default:
          log("EXPECTED unknown msg: ", evt)
      }
    } catch (err) {
      console.error('error handling event', err)
      throw err
    }
  }

  handleIframeSetup({ warriors: warriorStats, firstRoll, gameLength, tableSize, wootgumpMultipler }: SetupMessage) {
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
        sizeX: tableSize,
        sizeY: tableSize,
        gameLength,
        wootgumpMultipler,
      });
      this.grid = grid;

      this.boardGenerate.setGrid(grid);
      this.latest = firstRoll.index
      this.grid.start(firstRoll.random);
      this.entity.fire("start");

      // this.handleTick(firstRoll)
    } catch (err: any) {
      console.error("error", err);
      throw err;
    }
  }

  private pingParentPage(tick: TickOutput) {
    const warriors = this.grid.rankedWarriors().map((w) => {
      return {
        id: w.id,
        name: w.name,
        currentHealth: w.currentHealth,
        initialHealth: w.initialHealth,
        wootgumpBalance: w.wootgumpBalance,
        attack: w.attack,
        defense: w.defense,
        firstGump: (this.grid.firstGump === w),
        firstBlood: (this.grid.firstBlood === w),
        battlesWon: this.grid.battlesWon[w.id] || 0,
      }
    })
    parent.postMessage(JSON.stringify({
      type: 'gameTick',
      data: warriors,
      tick: this.latest,
    }), '*')
  }

  private handleTick(roll: IFrameRoll) {
    if (this.grid.isOver()) {
      return
    }
    log("queueing tick: ", roll.index.toString());
    this.singleton.push(() => {
      return this.asyncHandleTick(roll)
    })
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
        console.error('should have received', this.latest + 1, ' but received ', index)
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
      const tickOutput = this.grid.handleTick(random)
      this.entity.fire(TICK_EVT, tickOutput);
      this.latest = index;
      if (this.grid.isOver()) {
        this.entity.fire(GAME_OVER_EVT)
      }
      this.pingParentPage(tickOutput)
    } catch (err) {
      console.error('error handling async tick: ', err)
      return
    }
  }
}

export default ChainConnector;
