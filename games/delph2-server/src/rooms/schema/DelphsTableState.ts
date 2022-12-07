import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export enum State {
  move,
  harvest,
  battle,
  dead,
  taunt,
  chasing,
  deerAttack,
}

export class Music extends Schema {
  @type("string") name:string
  @type("string") description?:string
  @type("string") url:string
  @type("number") duration:number
  @type("number") startedAt:number
}

export class Vec2 extends Schema {
  @type("number") x: number = 0;
  @type("number") z: number = 0;
}

export class Item extends Schema {
  @type("string") address: string
  @type("number") id: number
}

export class InventoryOfItem extends Schema {
  @type(Item) item:Item
  @type("number") quantity: number
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
  @type("number") attack:number
  @type("number") defense:number
  @type("number") initialHealth:number
  @type("number") currentHealth:number
  @type("number") initialGump:number
  @type("number") wootgumpBalance:number
  @type({ map: InventoryOfItem }) initialInventory = new MapSchema<InventoryOfItem>({})
  @type({ map: InventoryOfItem }) inventory = new MapSchema<InventoryOfItem>({})
  @type(Item) currentItem:Item
  @type("boolean") autoPlay = false
}

export class Battle extends Schema {
  @type("string") id:string
  @type({array: "string" }) warriorIds = new ArraySchema<string>();
}

export class DeerAttack extends Schema {
  @type("string") id:string
  @type("string") warriorId:string
  @type("string") deerId:string
}

export class DelphsTableState extends Schema {
  @type("number") tick: number = 0;
  @type("string") seed: string = "todo:initialseed";
  @type({ map: Warrior }) warriors = new MapSchema<Warrior>({});
  @type({ map: Battle }) battles = new MapSchema<Battle>({});
  @type({ map: DeerAttack }) deerAttacks = new MapSchema<DeerAttack>({});
  @type({ map: Vec2 }) wootgump = new MapSchema<Vec2>({});
  @type({ map: Vec2 }) trees = new MapSchema<Vec2>({});
  @type({ map: Deer }) deer = new MapSchema<Deer>({});
  @type(Music) nowPlaying = new Music({})
}
