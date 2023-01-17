import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";


export enum SwingDirection {
  none,
  high,
  middle,
  low,
}

export enum BlockDirection {
  none,
  high,
  middle,
  low,
}

export enum BattlePhase {
  pending,
  strategySelect,
  battling,
  completed,
}

export enum RoomType {
  continuous,
  match,
}

export enum LocomotionState {
  move,
  arrived,
  frozen,
}

export enum BehavioralState {
  move,
  battle,
  dead,
  taunt,
  chasing,
}

export enum QuestObjectKind {
  chest
}

export enum QuestType {
  first,
  timed,
  keyCarrier,
  random,
}

export enum GameNags {
  deer,
  roving,
  traps,
}

export class Music extends Schema {
  @type("string") name: string
  @type("string") url: string
  @type("number") duration: number
  @type("number") startedAt: number
  @type("string") description?: string
  @type("string") artwork?: string
  @type("string") artist: string
}

export class Vec2 extends Schema {
  @type("number") x: number = 0;
  @type("number") z: number = 0;
}

export class RovingAreaAttack extends Schema {
  @type("string") id:string;
  @type(Vec2) position: Vec2 = new Vec2();
}

export class Item extends Schema {
  @type("string") address: string
  @type("number") id: number

  @type("string") name: string
  @type("string") description: string
  @type("string") art:string
  @type("string") frameColor:string
  @type("boolean") field?: boolean
  @type("boolean") battle?: boolean
  @type("number") costToPlay?:number
  @type({ array: "number" }) repels = new ArraySchema<GameNags>()
  @type("boolean") affectsAllPlayers?: boolean
}

export class InventoryOfItem extends Schema {
  @type(Item) item: Item
  @type("number") quantity: number
}

export class Trap extends Schema {
  @type("string") id: string
  @type(Vec2) position: Vec2 = new Vec2();
  @type("string") plantedBy: string
}

export class Locomotion extends Schema {
  @type(Vec2) position: Vec2 = new Vec2();
  @type("number") speed: number = 0
  @type(Vec2) destination: Vec2 = new Vec2();
  @type("number") locomotionState: LocomotionState = 0;
  @type(Vec2) focus: Vec2 = new Vec2();

  @type("number") maxSpeed: number
  @type("number") walkSpeed: number
}

export class BattleCommands extends Schema {
  @type("number") swingDirection: SwingDirection = SwingDirection.none
  @type("number") blockDirection: BlockDirection = BlockDirection.none
  @type("number") impactStrength:number = 0
}

export class Deer extends Schema {
  @type("string") id: string
  @type("number") behavioralState: BehavioralState = 0

  @type(Locomotion) locomotion = new Locomotion()
  @type(BattleCommands) battleCommands = new BattleCommands
}

export class Warrior extends Schema {
  @type(Locomotion) locomotion = new Locomotion()

  @type("number") behavioralState: BehavioralState = 0
  @type(BattleCommands) battleCommands = new BattleCommands

  @type("string") id: string
  @type("string") name: string
  @type("number") attack: number
  @type("number") defense: number
  @type("number") currentAttack: number
  @type("number") currentDefense: number
  @type("number") initialHealth: number
  @type("number") currentHealth: number
  @type("number") initialGump: number
  @type("number") wootgumpBalance: number
  @type({ map: InventoryOfItem }) initialInventory = new MapSchema<InventoryOfItem>({})
  @type({ map: InventoryOfItem }) inventory = new MapSchema<InventoryOfItem>({})
  @type(Item) currentItem: Item

  @type("boolean") autoPlay = false

  @type({ array: "number" }) color = new ArraySchema<number>();

  @type("string") avatar?:string
}

export class Battle extends Schema {
  @type("string") id: string
  @type("number") phase: BattlePhase
  @type(Vec2) center = new Vec2()
  @type({ array: "string" }) warriorIds = new ArraySchema<string>();
  @type({ map: Item}) strategies = new MapSchema<Item>({});
  @type("number") round:number
}

export class QuestObject extends Schema {
  @type("string") id: string
  @type("number") kind: QuestObjectKind
  @type(Vec2) position: Vec2 = new Vec2()
}

export class Quest extends Schema {
  @type("number") startedAt: number

  @type("number") kind: QuestType = 0
  @type(QuestObject) object: QuestObject
  // the player everyone is trying to get
  @type("string") piggyId: string
}

export class MaxStats extends Schema {
  @type("number") maxAttack: number
  @type("number") maxDefense: number
  @type("number") maxHealth: number
}

export class Player extends Schema {
  @type("string") id: string
  @type("string") name: string
  @type("string") token: string
}

export class DelphsTableState extends Schema {
  @type("number") tick: number = 0;
  @type("number") roomType: RoomType = RoomType.continuous;
  @type("string") matchId: string;
  @type("boolean") acceptInput: boolean;
  @type("string") persistantMessage: string = "";
  @type("string") seed: string;

  @type(Quest) currentQuest?: Quest;
  @type("boolean") questActive = false

  @type(MaxStats) maxStats = new MaxStats({})

  @type({ array: Player }) expectedPlayers = new ArraySchema<Player>()
  @type("number") playerCount?:number

  @type({ map: Warrior }) warriors = new MapSchema<Warrior>({})
  @type({ map: Battle }) battles = new MapSchema<Battle>({})
  @type({ map: RovingAreaAttack }) rovingAreaAttacks = new MapSchema<RovingAreaAttack>({})
  @type({ map: Vec2 }) wootgump = new MapSchema<Vec2>({})
  @type({ map: Vec2 }) trees = new MapSchema<Vec2>({})
  @type({ map: Deer }) deer = new MapSchema<Deer>({})
  @type({ map: Trap }) traps = new MapSchema<Trap>({})
  @type(Music) nowPlaying = new Music({})
}
