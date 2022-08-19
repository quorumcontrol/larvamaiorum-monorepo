import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";

// import { skaleMainnet } from "../utils/SkaleChains";
// import { DelphsTable, DelphsTable__factory, Player, Player__factory } from "../typechain";
import Warrior, { WarriorStats } from "../boardLogic/Warrior";
import Grid from "../boardLogic/Grid";
import BoardGenerate from "./BoardGenerate";
// import { DiceRolledEvent, StartedEvent } from "../typechain/DelphsTable";
// import addresses from '../deployments/skale/addresses.json'
// import MulticallWrapper from "kasumah-multicall";
import { GAME_OVER_EVT, NO_MORE_MOVES_EVT, ORCHESTRATOR_TICK, TICK_EVT } from "../utils/rounds";
import { MESSAGE_EVENT } from "../appWide/AppConnector";

const log = console.log; //debug('chainConnector')

// const DELPHS_ADDRESS = addresses.DelphsTable
// const PLAYER_ADDRESS = addresses.Player

// function bigNumMin(a: BigNumber, b: BigNumber) {
//   if (a.lte(b)) {
//     return a
//   }
//   return b
// }

interface IFrameRoll {
  index: number,
  random: string,
  destinations: { id: string, x: number, y: number }[]
}

interface SetupMessage { tableId: string, warriors: WarriorStats[], gameLength: number, firstRoll: IFrameRoll }

@createScript("chainConnector")
class ChainConnector extends ScriptTypeBase {
  // provider: ethers.providers.StaticJsonRpcProvider;
  // delphs: DelphsTable;
  // player: Player;
  grid: Grid;

  inProgress?: Promise<any>

  settingUp = false

  // started = false;
  // startedAt?: BigNumber;

  // private tableId?: string

  latest: number;

  boardGenerate: BoardGenerate

  timeToNextRound = -1;

  initialize() {
    log("chain connector initialized");
    this.handleTick = this.handleTick.bind(this);
    this.asyncHandleTick = this.asyncHandleTick.bind(this);
    // this.handleStarted = this.handleStarted.bind(this);
    // this.provider = new ethers.providers.StaticJsonRpcProvider(skaleMainnet.rpcUrls.default);

    // const multicall = new MulticallWrapper(this.provider, skaleMainnet.id)

    // this.delphs = multicall.syncWrap<DelphsTable>(DelphsTable__factory.connect(DELPHS_ADDRESS, this.provider));
    // this.player = multicall.syncWrap<Player>(Player__factory.connect(PLAYER_ADDRESS, this.provider));

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
    // this.asyncSetup();
  }

  update(dt: number) {
    if (this.timeToNextRound > 0) {
      this.timeToNextRound -= dt
      if (this.timeToNextRound < 1) {
        this.timeToNextRound = -1
        this.entity.fire(NO_MORE_MOVES_EVT)
      }
    }
    // if (this.app.keyboard.wasPressed(pc.KEY_SPACE)) {
    //     this.manualTick()
    //   }
  }

  // private async manualTick() {
  //   console.log('manual tick')
  //   const roll = await this.delphs.rolls(this.latest.add(1))
  //   this.handleTick(this.latest.add(1) , constants.Zero, roll);
  // }



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

      // if (table.startedAt.gt(0)) {
      //   this.startedAt = table.startedAt;
      // }

      // if (table.startedAt.gt(0) && latest.gte(table.startedAt)) {
      //   log("table is already in progress, let's catch up");
      //   const end = table.startedAt.add(table.gameLength).sub(1)
      //   await this.catchUp(table.startedAt, bigNumMin(end, latest));
      //   // await this.catchUp(table.startedAt, table.startedAt.add(0));
      // }


      // log("setting up event filters", this.delphs.filters.Started(tableId));

      // this.delphs.on(this.delphs.filters.Started(tableId, null), this.handleStarted);
      // this.delphs.on(this.delphs.filters.DiceRolled(null, null, null), this.handleTick);
    } catch (err: any) {
      console.error("error", err);
      throw err;
    }
  }

  // async asyncSetup() {
  //   try {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const tableId = urlParams.get("tableId");
  //     if (!tableId) {
  //       log("no table id");
  //       return;
  //     }
  //     console.log('tableId: ', tableId)
  //     this.tableId = tableId
  //     const [table, players, latest] = await Promise.all([
  //       this.delphs.tables(tableId),
  //       this.delphs.players(tableId),
  //       this.delphs.latestRoll(),
  //     ]);
  //     log("table", table, 'latest', latest, 'players', players);

  //     const names = await Promise.all(
  //       players.map(async (addr) => {
  //         return this.player.name(addr);
  //       })
  //     );
  //     log("names", names);

  //     const warriors = players.map((p, i) => {
  //       const name = names[i];
  //       if (!name) {
  //         throw new Error("weirdness, non matching lengths");
  //       }
  //       return new Warrior({
  //         id: p,
  //         name: name,
  //         attack: 0,
  //         defense: 0,
  //         initialHealth: 0,
  //       });
  //     });
  //     log("warriors: ", warriors);
  //     const grid = new Grid({
  //       warriors,
  //       seed: "nonsense",
  //       sizeX: 10,
  //       sizeY: 10,
  //       gameLength: table.gameLength.toNumber()
  //     });
  //     this.grid = grid;

  //     this.boardGenerate.setGrid(grid);

  //     if (table.startedAt.gt(0)) {
  //       this.startedAt = table.startedAt;
  //     }

  //     if (table.startedAt.gt(0) && latest.gte(table.startedAt)) {
  //       log("table is already in progress, let's catch up");
  //       const end = table.startedAt.add(table.gameLength).sub(1)
  //       await this.catchUp(table.startedAt, bigNumMin(end, latest));
  //       // await this.catchUp(table.startedAt, table.startedAt.add(0));
  //     }


  //     // log("setting up event filters", this.delphs.filters.Started(tableId));

  //     // this.delphs.on(this.delphs.filters.Started(tableId, null), this.handleStarted);
  //     // this.delphs.on(this.delphs.filters.DiceRolled(null, null, null), this.handleTick);
  //   } catch (err) {
  //     console.error("error", err);
  //     throw err;
  //   }
  // }

  // async updateWarriorStats() {
  //   if (!this.tableId) {
  //     throw new Error('updating without a table')
  //   }
  //   console.log('updating warrior stats')
  //   return Promise.all(
  //     this.grid.warriors.map(async (warrior) => {
  //       const addr = warrior.id
  //       const stats = await this.delphs.statsForPlayer(this.tableId!, addr);
  //       warrior.attack = stats.attack.toNumber()
  //       warrior.defense = stats.defense.toNumber()
  //       warrior.initialHealth = stats.health.toNumber()
  //       warrior.currentHealth = stats.health.toNumber()
  //     })
  //   );
  // }

  // // start and end are inclusive
  // async catchUp(start: BigNumber, end: BigNumber) {
  //   log("catching up", start.toString(), end.toString());
  //   const missing = await Promise.all(
  //     Array(end.sub(start).add(1).toNumber())
  //       .fill(true)
  //       .map((_, i) => {
  //         return this.delphs.rolls(start.add(i));
  //       })
  //   );
  //   // log("missing: ", missing);
  //   missing.forEach((roll, i) => {
  //     this.handleTick(start.add(i), constants.Zero, roll);
  //   });
  // }

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
      // if (!this.tableId) {
      //   throw new Error('weird state: no table id but handling ticks')
      // }
      log("async tick: ", index.toString());
      if (index !== this.latest + 1) {
        throw new Error('receive out of order event')
      }
      // if (this.latest && index.gt(this.latest.add(1))) {
      //   log('latest: ', this.latest)
      //   await this.catchUp(this.latest.add(1), index)
      // }

      // if (!this.started) {
      //   log("starting the game");
      //   this.started = true;
      //   await this.updateWarriorStats()
      //   this.grid.start(random);
      //   this.entity.fire("start");
      // }

      // get the destinations for the roll
      // const destinations = await this.delphs.destinationsForRoll(this.tableId, index.sub(1))
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

  // handleStarted(_tableId: string, startedAt: BigNumber, evt?: StartedEvent) {
  //   log("received starting event", evt, "setting started at to ", startedAt.toNumber());
  //   this.startedAt = startedAt;
  // }
}

export default ChainConnector;
