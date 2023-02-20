import { Schema, MapSchema, type, filter, filterChildren } from "@colyseus/schema";

export enum RoomState {
  waitingForPlayers,
  countdown,
  playing,
  gameOver,
}

export enum Messages {
  tileClick = "tileClick",
  characterClick = "characterClick",
  hudText = "hudText",
  taunt = "taunt",
  characterRemove = "characterRemove",
  latencyCheck = "l",
}

export interface TauntMessage {
  text: string
  audio: string
}

export interface LatencyCheckMessage {
  sentAt: number
}

export interface CharacterRemoveMessage {
  id: string
  playerId: string
}

export interface HudTextMessage {
  text: string
}

export interface SetDestinationMessage {
  x: number
  y: number
  characterId: string
}

export interface CharacterClickMessage {
  id: string
}

export interface TileClickmessage {
  x: number
  y: number
}

export enum LocomotionState {
  move,
  arrived,
  frozen,
}

export enum TileType {
  grass = 1,
  dirt = 2,
  trees = 3,
  water = 4,
  stone = 5,
}

export const tileTypeToEnglish = (tileType: TileType) => {
  switch (tileType) {
    case TileType.grass:
      return "Grass"
    case TileType.dirt:
      return "Dirt"
    case TileType.trees:
      return "Tree"
    case TileType.water:
      return "Water"
    case TileType.stone:
      return "Stone"
  }
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
  @type("number") x: number = 0
  @type("number") z: number = 0
}

export class Locomotion extends Schema {
  @type(Vec2) position: Vec2 = new Vec2();
  @type("number") speed: number = 0
  @type(Vec2) destination: Vec2 = new Vec2();
  @type("number") locomotionState: LocomotionState = 0;
  // focus might be unused, but keeping it for consistency with existing code
  // and for the future, where a battle might happen and the focus would change.
  // @type(Vec2) focus: Vec2 = new Vec2();

  // @type("number") maxSpeed: number
  @type("number") walkSpeed: number
}

export class Player extends Schema {
  @type("string") id: string
  @type("string") name: string
  @type("string") token: string

  @filter(function (this: Player, client: any, value: any) {
    return this.id === client.sessionId;
  })
  @type("string") highlightedCharacterId: string = ""
}

export class Character extends Schema {
  @type("string") id: string
  @type("string") playerId: string
  @type("string") tileId: string
  @type(Locomotion) locomotion: Locomotion = new Locomotion()
  @type("string") avatar: string

  @filterChildren(function (client: any, key: string) {
    return key === client.sessionId;
  })
  @type({ map: "boolean" }) highlightedForPlayer = new MapSchema<boolean>();
}

export class Tile extends Schema {
  @type("string") id: string
  @type("number") x: number
  @type("number") y: number
  @type("number") type: TileType
  @filterChildren(function (client: any, key: string) {
    return key === client.sessionId;
  })
  @type({ map: "boolean" }) highlightedForPlayer = new MapSchema<boolean>();
}

export class PickleChessState extends Schema {
  @type("string") id: string
  @type("number") roomState: RoomState = RoomState.waitingForPlayers
  @type("string") winner?:string
  @type("string") persistantMessage:string = "Waiting for Players"

  @type({ map: Tile }) board = new MapSchema<Tile>();
  @type({ map: Character }) characters = new MapSchema<Character>();
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(Music) nowPlaying = new Music({})
}
