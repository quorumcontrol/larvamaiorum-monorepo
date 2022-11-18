"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelphsTable = void 0;
const colyseus_1 = require("colyseus");
const DelphsTableState_1 = require("./schema/DelphsTableState");
const DelphsTableLogic_1 = __importDefault(require("../game/DelphsTableLogic"));
const Warrior_1 = require("../game/Warrior");
class DelphsTable extends colyseus_1.Room {
    onCreate(options) {
        this.setState(new DelphsTableState_1.DelphsTableState());
        this.game = new DelphsTableLogic_1.default(this.state);
        this.game.start();
        this.onMessage("updateDestination", (client, destination) => {
            console.log(client.sessionId, 'updateDestination', destination);
            this.game.updateDestination(client.sessionId, destination);
        });
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
        const random = (0, Warrior_1.generateFakeWarriors)(1, client.sessionId);
        this.game.addWarrior(client.sessionId, random[0]);
    }
    onLeave(client, consented) {
        //TODO: handle constented
        this.game.removeWarrior(client.sessionId);
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
        this.game.stop();
    }
}
exports.DelphsTable = DelphsTable;
