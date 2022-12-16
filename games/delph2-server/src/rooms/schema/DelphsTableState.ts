import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export enum RoomType {
  continuous,
  match,
}

export enum State {
  move,
  harvest,
  battle,
  dead,
  taunt,
  chasing,
  deerAttack,
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

export class Music extends Schema {
  @type("string") name: string
  @type("string") url: string
  @type("number") duration: number
  @type("number") startedAt: number
  @type("string") description?: string
  @type("string") artwork?: string
}

export class Vec2 extends Schema {
  @type("number") x: number = 0;
  @type("number") z: number = 0;
}

export class Item extends Schema {
  @type("string") name: string
  @type("string") description: string
  @type("string") address: string
  @type("number") id: number
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

export class Deer extends Schema {
  @type("string") id: string
  @type(Vec2) position: Vec2 = new Vec2();
  @type(Vec2) destination: Vec2 = new Vec2();
  @type("number") state: State = 0
  @type("number") speed: number = 0
}

export class Warrior extends Schema {
  @type(Vec2) position: Vec2 = new Vec2();
  @type(Vec2) destination: Vec2 = new Vec2();
  @type("number") state: State = 0
  @type("number") speed: number = 0

  @type("string") id: string
  @type("string") name: string
  @type("number") attack: number
  @type("number") defense: number
  @type("number") maxSpeed: number
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

  @type("number") bodyType = 0
  @type({ array: "number" }) color = new ArraySchema<number>();
}

export class Battle extends Schema {
  @type("string") id: string
  @type({ array: "string" }) warriorIds = new ArraySchema<string>();
}

export class DeerAttack extends Schema {
  @type("string") id: string
  @type("string") warriorId: string
  @type("string") deerId: string
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
  @type("string") seed: string = "todo:initialseed";

  @type(Quest) currentQuest?: Quest;
  @type("boolean") questActive = false

  @type(MaxStats) maxStats = new MaxStats({})

  @type({ array: Player }) expectedPlayers = new ArraySchema<Player>()

  @type({ map: Warrior }) warriors = new MapSchema<Warrior>({})
  @type({ map: Battle }) battles = new MapSchema<Battle>({})
  @type({ map: DeerAttack }) deerAttacks = new MapSchema<DeerAttack>({})
  @type({ map: Vec2 }) wootgump = new MapSchema<Vec2>({})
  @type({ map: Vec2 }) trees = new MapSchema<Vec2>({})
  @type({ map: Deer }) deer = new MapSchema<Deer>({})
  @type({ map: Trap }) traps = new MapSchema<Trap>({})
  @type(Music) nowPlaying = new Music({})
}
