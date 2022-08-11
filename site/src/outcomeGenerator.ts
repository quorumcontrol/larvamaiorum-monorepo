import debug from 'debug'
import { BigNumber, BytesLike } from 'ethers';
import { DelphsTable, Player } from '../contracts/typechain';
import Grid from './boardLogic/Grid';
import Warrior from './boardLogic/Warrior';

const log = debug('GamePlayer')

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

type Destinations = ThenArg<ReturnType<DelphsTable['destinationsForRoll']>>

interface InitializationOptions {
  delphs: DelphsTable
  player: Player
  tableId: string
}

class GamePlayer {
  delphs: DelphsTable;
  player: Player;
  grid?: Grid;

  inProgress?:Promise<any>

  started = false;
  startedAt?: BigNumber;

  private tableId:string

  latest?: BigNumber;

  constructor(opts: InitializationOptions) {
    log("chain connector initialized");
    this.delphs = opts.delphs
    this.player = opts.player
    this.tableId = opts.tableId
  }

  async run() {
    try {
      const [table, players, latest] = await Promise.all([
        this.delphs.tables(this.tableId),
        this.delphs.players(this.tableId),
        this.delphs.latestRoll(),
      ]);
      log("table", table, 'latest', latest, 'players', players);

      if (!table.startedAt.gt(0) || latest.lte(table.startedAt.add(table.gameLength))) {
        throw new Error('table is still in flight')
      }

      const names = await Promise.all(
        players.map(async (addr) => {
          return this.player.name(addr);
        })
      );
      log("names", names);

      const warriors = players.map((p, i) => {
        const name = names[i];
        if (!name) {
          throw new Error("weirdness, non matching lengths");
        }
        return new Warrior({
          id: p,
          name: name,
          attack: 0,
          defense: 0,
          initialHealth: 0,
        });
      });
      log("warriors: ", warriors);

      const grid = new Grid({
        warriors,
        seed: "nonsense",
        sizeX: 10,
        sizeY: 10,
        gameLength: table.gameLength.toNumber()
      });
      this.grid = grid;

      await this.updateWarriorStats()

      const end = table.startedAt.add(table.gameLength)
      this.startedAt = table.startedAt
      return this.catchUp(table.startedAt, end)

    } catch (err) {
      console.error("error", err);
      throw err;
    }
  }

  async updateWarriorStats() {
    if (!this.tableId || !this.grid) {
      throw new Error('updating without a table or grid')
    }
    log('updating warrior stats')
    return Promise.all(
      this.grid.warriors.map(async (warrior) => {
        const addr = warrior.id
        const stats = await this.delphs.statsForPlayer(this.tableId!, addr);
        warrior.attack = stats.attack.toNumber()
        warrior.defense = stats.defense.toNumber()
        warrior.initialHealth = stats.health.toNumber()
        warrior.currentHealth = stats.health.toNumber()
      })
    );
  }

  // start and end are inclusive
  async catchUp(start: BigNumber, end: BigNumber) {
    log("catching up", start.toString(), end.toString());
    const missing = await Promise.all(
      Array(end.sub(start).toNumber())
        .fill(true)
        .map(async (_, i) => {
          const [random, destinations] = await Promise.all([
            this.delphs.rolls(start.add(i)),
            this.delphs.destinationsForRoll(this.tableId, start.add(i - 1))
          ])
          return {
            random,
            destinations
          }
        })
    );
    log("missing: ", missing.length);
    return Promise.all(missing.map(({random, destinations}, i) => {
      return this.handleTick(start.add(i), random, destinations);
    }))
  }

  private handleTick(
    index: BigNumber,
    random: BytesLike,
    destinations: Destinations
  ) {
    if (!this.grid) {
      throw new Error('no grid')
    }
    if (this.grid.isOver()) {
      return Promise.resolve()
    }
    log("tick: ", index.toString());
    if (this.inProgress) {
      this.inProgress = this.inProgress.finally(() => {
        return this.asyncHandleTick(index, random, destinations)
      })
      return this.inProgress
    }
    this.inProgress = this.asyncHandleTick(index, random, destinations)
    return this.inProgress
  }

  private async asyncHandleTick(
    index: BigNumber,
    random: BytesLike,
    destinations: Destinations
  ) {
    try {
      if (!this.tableId || !this.grid) {
        throw new Error('weird state: missing table id or grid but handling ticks')
      }
      log("async tick: ", index.toString());
      if (this.latest?.gte(index)) {
        console.error('reprocessing old event: ', index.toString())
        return
      }
      if (this.startedAt && index.gte(this.startedAt)) {
        if (this.latest && index.gt(this.latest.add(1))) {
          log('latest: ', this.latest)
          await this.catchUp(this.latest.add(1), index)
        }

        if (!this.started) {
          log("starting the game");
          this.started = true;
          this.grid.start(random);
        }

        destinations.forEach((dest) => {
          const warrior = this.grid!.warriors.find((w) => w.id.toLowerCase() === dest.player.toLowerCase())
          if (!warrior) {
            throw new Error('bad warrior id')
          }
          warrior.destination = [dest.x.toNumber(), dest.y.toNumber()]
        })

        this.grid.handleTick(random)
        this.latest = index;
      } else {
        log('skip')
      }
    } catch (err) {
      console.error('error handling async tick: ', err)
      return
    }
  }
}

export default GamePlayer
