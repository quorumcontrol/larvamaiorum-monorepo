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
        this.game = new DelphsTableLogic_1.default(this);
        this.game.start();
        this.onMessage("updateDestination", (client, destination) => {
            console.log(client.sessionId, 'updateDestination', destination);
            this.game.updateDestination(client.sessionId, destination);
        });
        this.onMessage("playCard", (client, card) => {
            this.game.playCard(client.sessionId, card);
        });
        this.onMessage("setTrap", (client) => {
            this.game.setTrap(client.sessionId);
        });
        this.onMessage("getLatency", (client) => {
            client.send(new Date().getTime());
        });
    }
    onJoin(client, { name }) {
        console.log(client.sessionId, "joined!");
        const random = (0, Warrior_1.generateFakeWarriors)(1, client.sessionId)[0];
        if (name) {
            random.name = name;
        }
        this.game.addWarrior(client, random);
    }
    onLeave(client, consented) {
        //TODO: handle constented
        this.game.removeWarrior(client);
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
        this.game.stop();
    }
}
exports.DelphsTable = DelphsTable;
