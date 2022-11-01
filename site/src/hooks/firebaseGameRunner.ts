import { useQuery, useQueryClient } from "react-query"
import SingletonQueue from "../utils/singletonQueue"
import { memoize } from "../utils/memoize"
import { EventEmitter } from "events"
import { useEffect, useState } from "react"
import Grid, { DestinationSettings, ItemPlays } from "../boardLogic/Grid"
import Warrior, { WarriorState } from "../boardLogic/Warrior"
import { InventoryItem } from "../boardLogic/items"
import { doc, onSnapshot, query, getDocs, collection, where, updateDoc } from 'firebase/firestore'
import { addressToUid, db, uidToAddress } from "../utils/firebase"
import { TableStatus } from '../utils/tables'

const log = console.log //debug('gameRunner')
interface IFrameRoll {
  index: number,
  random: string,
  destinations: { id: string, x: number, y: number }[]
  items: { player: string, item: InventoryItem }[]
}

interface BoardSetup {
  currentPlayer: string
  seed: string
  tableSize: number
  gameLength: number
  warriors?: WarriorState[]
}

export class GameRunner extends EventEmitter {
  tableId: string
  iframe: HTMLIFrameElement

  private started = false

  latest = 0

  over = false

  singleton: SingletonQueue

  player: string

  latestState?: any // TODO: we should really type this using a converter

  private unsubscribe?: () => any

  grid?: Grid

  constructor(tableId: string, player: string, iframe: HTMLIFrameElement) {
    super()
    log('--------------- new firebase game runnner')
    this.singleton = new SingletonQueue(`game-runner-${tableId}`)
    this.tableId = tableId
    this.iframe = iframe
    this.player = player
  }

  async setup() {
    const docRef = doc(db, `/tables/${this.tableId}`)
    this.unsubscribe = onSnapshot(docRef, (doc) => {
      const data = doc.data()
      if (!data) {
        return
      }
      this.latestState = data

      if (!this.started && data.status !== TableStatus.UNSTARTED) {
        this.singleton.push(() => this.go())
      }

      const latest = this.latest
      this.latestState.rolls.slice(latest).forEach((_roll:any, i:number) => {
        this.singleton.push(async () => {
          console.log('handle roll', latest, i)
          return this.handleRoll(latest + i)
        })
      })
    })

    log('------------ firebase game runner setup')

    return this
  }

  stop() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  setDestination(x:number, y:number) {
    console.log("set destination")
    if (!this.latestState) {
      console.error("missing latest state")
      throw new Error('missing latest state')
    }
    const ref = doc(db, "tables", this.tableId, "moves", addressToUid(this.player))
    const update = {
      [this.latestState.round]: {
        destination: {
          x,
          y,
        }
      }
    }
    console.log("updating update: ", update)
    return updateDoc(ref, update)
  }

  playCard(address:string, id: number) {
    if (!this.latestState) {
      throw new Error('missing latest state')
    }
    const ref = doc(db, "tables", this.tableId, "moves", addressToUid(this.player))
    return updateDoc(ref, {
      [this.latestState.round]: {
        item: { address, id }
      }
    })
  }

  private checkForEnd() {
    if (this.grid?.isOver()) {
      log('game over')
      this.over = true
      this.emit('END')
      this.stop()
      return
    }
    log('grid over? ', this.grid?.isOver(), this.grid?.tick)
  }

  private async go() {
    if (this.started) {
      console.error('tried to double start')
      return
    }
    log('----------- setting gameRunner.started to true')
    this.started = true

    this.grid = new Grid({
      warriors: this.latestState.warriors.map((ws: WarriorState) => new Warrior(ws)),
      sizeX: this.latestState.tableSize,
      sizeY: this.latestState.tableSize,
      wootgumpMultipler: this.latestState.wootgumpMultiplier,
      gameLength: this.latestState.rounds,
      seed: this.latestState.startRoll.randomness,
    })
    this.grid.start(this.latestState.startRoll.randomness)

    const msg: BoardSetup = {
      currentPlayer: this.player,
      seed: this.latestState.startRoll.randomness,
      tableSize: this.latestState.tableSize,
      gameLength: this.latestState.rounds,
      warriors: this.grid.rankedWarriors().map((w) => w.toWarriorState()),
    }
    log('shipping setup', this.latestState)
    return this.ship('setupBoard', msg)
  }

  private async handleRoll(idx: number) {
    if (!this.latestState) {
      throw new Error("handling roll without a latest state")
    }
    console.log("handle roll: ", idx)
    const movesIdx = idx// - 1
    console.log("looking for moves: ", movesIdx)
    const moves = collection(db, "tables", this.tableId, "moves")
    const q = query(moves, where(movesIdx.toString(), "!=", null))
    const snapshot = await getDocs(q)

    const roll = this.latestState.rolls[idx]

    const iframeRoll: IFrameRoll = {
      index: roll.roll,
      random: roll.randomness,
      destinations: [],
      items: [],
    }

    console.log("moves: ", snapshot, snapshot.size)

    snapshot.forEach((doc) => {
      const data = doc.data()
      console.log("moves doc: ", data)
      if (!data) {
        throw new Error('no data')
      }
      const player = uidToAddress(doc.id)
      const playAndDestination = data[movesIdx]
      console.log("playAndDestination: ", playAndDestination)

      if (playAndDestination.destination) {
        iframeRoll.destinations.push({ ...playAndDestination.destination, id: player })
      }
      if (playAndDestination.item) {
        iframeRoll.items.push({ item: playAndDestination.item, player })
      }
    })
    this.shipRoll(iframeRoll)
  }

  private shipRoll(roll: IFrameRoll) {
    const tickReport = this.updateGrid(roll)
    log("ship: ", tickReport)
    this.latest++
    this.ship('tick', tickReport)
    this.checkForEnd()
  }

  private updateGrid(roll: IFrameRoll) {
    if (!this.grid) {
      throw new Error('missing grid')
    }
    if (!this.grid.isOver()) {
      const destinations = roll.destinations.reduce((memo, destination) => {
        return {
          ...memo,
          [destination.id]: { x: destination.x, y: destination.y }
        }
      }, {} as DestinationSettings)

      const itemPlays = roll.items.reduce((memo, play) => {
        return {
          ...memo,
          [play.player]: play.item
        }
      }, {} as ItemPlays)

      return this.grid.handleTick(roll.random, destinations, itemPlays)
    }
  }

  ship(msgType: string, msg: any) {
    this.iframe.contentWindow?.postMessage(
      JSON.stringify({
        type: msgType,
        data: {
          ...msg,
        }
      }),
      "*"
    );
  }
}

const getGameRunnerFor = memoize((tableId: string, address: string, iframe?: HTMLIFrameElement) => {
  return new GameRunner(tableId!, address, iframe!).setup()
})

const useGameRunner = (tableId?: string, player?: string, iframe?: HTMLIFrameElement, ready?: boolean) => {
  const queryClient = useQueryClient()

  const query = useQuery(['/game-runner', tableId], async () => {
    log("----------------------- useQuery refetched")
    return getGameRunnerFor(tableId!, player!, iframe!)
  }, {
    enabled: !!tableId && !!iframe && !!player && ready,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
  const [over, setOver] = useState(query.data ? query.data.over : false)

  useEffect(() => {
    if (!query.data) {
      return
    }
    const handler = () => {
      setTimeout(() => {
        queryClient.invalidateQueries(["/wootgump-balance", player])
        queryClient.refetchQueries(["/wootgump-balance", player])
        queryClient.invalidateQueries(["/delphs-gump-balance", player])
        queryClient.refetchQueries(["/delphs-gump-balance", player])
      }, 5000)

      setOver(true)
    }
    query.data.on('END', handler)
    return () => {
      query.data.removeListener('END', handler)
    }
  }, [setOver, query.data, player, queryClient])

  return { ...query, over }
}

export default useGameRunner
