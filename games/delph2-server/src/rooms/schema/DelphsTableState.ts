import { Schema, type, MapSchema } from "@colyseus/schema";

export enum State {
  move,
  harvest,
  battle,
  dead,
  taunt
}

export class Vec2 extends Schema {
  @type("number") x: number = 0;
  @type("number") z: number = 0;
}

export class Item extends Schema {
  @type("string") address: string
  @type("string") id: string
}

export class InventoryOfItem extends Schema {
  @type(Item) item:Item
  @type("number") quantity: number = 0
}

export class Warrior extends Schema {
  @type(Vec2) position: Vec2 = new Vec2();
  @type(Vec2) destination: Vec2 = new Vec2();
  @type("number") state: State = 0
  @type("number") speed: number = 4

  @type("string") id: string
  @type("string") name: string
  @type("number") attack:number
  @type("number") defense:number
  @type("number") initialHealth:number = 0
  @type("number") currentHealth:number = 0
  @type("number") initialGump:number = 0
  @type("number") wootgumpBalance:number = 0
  @type({ map: InventoryOfItem }) initialInventory = new MapSchema<InventoryOfItem>({})
  @type({ map: InventoryOfItem }) inventory = new MapSchema<InventoryOfItem>({})
  @type(Item) currentItem?:Item
  @type("boolean") autoPlay = false
}

export class DelphsTableState extends Schema {
  @type("number") tick: number = 0;
  @type("string") seed: string = "todo:initialseed";
  @type({ map: Warrior }) warriors = new MapSchema<Warrior>({});
  @type({ map: Vec2 }) wootgump = new MapSchema<Vec2>({});
}