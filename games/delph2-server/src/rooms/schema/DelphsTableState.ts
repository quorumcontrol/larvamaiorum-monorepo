import { Schema, type, MapSchema } from "@colyseus/schema";

export enum State {
  move,
  harvest,
  battle,
  dead,
  taunt
}

export class Vec2 extends Schema {
  @type("number") x: number;
  @type("number") z: number;
}

export class Player extends Schema {
  @type("string") name: string = ""
  @type(Vec2) position: Vec2 = new Vec2();
  @type(Vec2) destination: Vec2 = new Vec2();
  @type("number") state: State = 0
}

export class DelphsTableState extends Schema {
  @type("number") tick: number = 0;
  @type("string") seed: string = "todo:initialseed";
  @type({ map: Player }) players = new MapSchema<Player>({});
}
