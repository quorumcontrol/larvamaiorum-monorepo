import { Schema, type, MapSchema } from "@colyseus/schema";

export interface ReservationRequest {
  id: string
  name: string
  avatar?: string
  size: number
}

export class Player extends Schema {
  @type("string") sessionId:string
  @type("string") name:string
  @type("string") id:string
  @type("string") avatar?:string
}

export class LobbyState extends Schema {
  @type({ map: Player}) twoPersonWaiting = new MapSchema<Player>({})
  @type({ map: Player }) fourPersonWaiting = new MapSchema<Player>({})
}
