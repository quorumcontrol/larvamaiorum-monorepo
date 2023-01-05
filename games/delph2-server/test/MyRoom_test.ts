import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";

// import your "arena.config.ts" file here.
import appConfig from "../src/arena.config";
import { DelphsTableState, RoomType } from "../src/rooms/schema/DelphsTableState";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  before(async () => colyseus = await boot(appConfig));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("connects into the continuous room", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<DelphsTableState>("delphs", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room, { name: "john" });

    // make your assertions
    assert.strictEqual(client1.sessionId, room.clients[0].sessionId);

    // wait for state sync
    await client1.waitForNextPatch();

    assert.equal(RoomType.continuous, client1.state.roomType);
  });

  it.only("connects into a match room", async () => {
    const client = await colyseus.sdk.joinOrCreate<DelphsTableState>("match", {matchId: "test", id: "alice", roomType: RoomType.match, expectedPlayers: [{id: "alice"}, {id: "bob"}]})
    assert.ok(client.sessionId);

    const client2 = await colyseus.sdk.joinOrCreate<DelphsTableState>("match", {matchId: "test", id: "bob", roomType: RoomType.match, expectedPlayers: [{id: "alice"}, {id: "bob"}]})
    assert.ok(client2.sessionId);

    await client.waitForNextPatch()
    await client2.waitForNextPatch()

    assert.equal(client.state.warriors.size, 2)
    assert.equal(client2.state.warriors.size, 2)

    // `room` is the server-side Room instance reference.
    // const room = await colyseus.createRoom<DelphsTableState>("match", {id: "bobby", roomType: RoomType.match, expectedPlayers: [{id: "alice"}, {id: "bob"}]});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    // const client1 = await colyseus.connectTo(room, { id: "bobby", name: "john" });

    // // make your assertions
    // assert.strictEqual(client1.sessionId, room.clients[0].sessionId);

    // // wait for state sync
    // await room.waitForNextPatch();

    // assert.equal(RoomType.match, client1.state.roomType);
  });
});
