"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelphsTable = void 0;
const colyseus_1 = require("colyseus");
const DelphsTableState_1 = require("./schema/DelphsTableState");
const DelphsTableLogic_1 = __importDefault(require("../game/DelphsTableLogic"));
const Warrior_1 = require("../game/Warrior");
const randoms_1 = require("../game/utils/randoms");
class DelphsTable extends colyseus_1.Room {
    onCreate(options) {
        this.setState(new DelphsTableState_1.DelphsTableState({ matchId: options.matchId }));
        this.state.assign({
            seed: (0, randoms_1.randomInt)(100000).toString()
        });
        if (options.expectedPlayers) {
            console.log('creating with expected players');
            this.state.expectedPlayers.push(...options.expectedPlayers.map((player) => new DelphsTableState_1.Player(player)));
        }
        else {
            console.log('normal create');
        }
        this.state.assign({
            roomType: options.roomType,
        });
        this.game = new DelphsTableLogic_1.default(this);
        this.game.start();
        this.onMessage("updateDestination", (client, destination) => {
            console.log(client.sessionId, 'updateDestination', destination);
            this.game.updateDestination(client.sessionId, destination);
        });
        this.onMessage("playCard", (client, card) => {
            this.game.playCard(client.sessionId, card);
        });
        this.onMessage("getLatency", (client) => {
            client.send(new Date().getTime());
        });
    }
    onAuth(_client, options, _request) {
        console.log("on auth");
        if (this.state.expectedPlayers.length == 0) {
            return true;
        }
        if (this.state.expectedPlayers && this.state.expectedPlayers.some((player) => player.id === options.id)) {
            return true;
        }
        console.log("no states matched, false");
        return false;
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
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (consented) {
                    throw new Error("consented leave");
                }
                yield this.allowReconnection(client, 10); // 2nd parameter is seconds
            }
            catch (e) {
                this.game.removeWarrior(client);
            }
        });
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
        this.game.stop();
    }
}
exports.DelphsTable = DelphsTable;
