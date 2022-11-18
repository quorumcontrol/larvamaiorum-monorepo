"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const playcanvas_1 = require("playcanvas");
const DelphsTableState_1 = require("../rooms/schema/DelphsTableState");
const randoms_1 = require("./utils/randoms");
const Warrior_1 = __importDefault(require("./Warrior"));
class DelphsTableLogic {
    // for now assume a blank table at construction
    // TODO: handle a populated state with existing warriors, etc
    constructor(state) {
        this.state = state;
        this.warriors = {};
        this.wootgump = {};
        this.trees = {};
    }
    start() {
        let previous = new Date();
        this.update(0);
        this.intervalHandle = setInterval(() => {
            const diff = (new Date().getTime()) - previous.getTime();
            previous = new Date();
            this.update(diff / 1000);
        }, 100);
        for (let i = 0; i < 10; i++) {
            this.spawnOneGump(this.randomPosition());
        }
        for (let i = 0; i < 80; i++) {
            const position = this.randomPosition();
            this.spawnTree(new playcanvas_1.Vec2(position.x, position.z));
        }
    }
    stop() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
    }
    update(dt) {
        Object.values(this.warriors).forEach((w) => {
            w.update(dt);
        });
        this.spawnGump();
        this.checkForHarvest();
    }
    addWarrior(sessionId, stats) {
        console.log('add warrior', stats);
        const position = this.randomPosition();
        const state = new DelphsTableState_1.Warrior(Object.assign(Object.assign({}, stats), { speed: 0, wootgumpBalance: stats.initialGump, currentHealth: stats.initialHealth }));
        console.log("state: ", state.toJSON());
        state.position.assign(position);
        state.destination.assign(position);
        this.warriors[sessionId] = new Warrior_1.default(state);
        this.state.warriors.set(sessionId, state);
    }
    removeWarrior(sessionId) {
        delete this.warriors[sessionId];
        this.state.warriors.delete(sessionId);
    }
    updateDestination(sessionId, { x, z }) {
        this.warriors[sessionId].setDestination(x, z);
    }
    spawnOneGump(position) {
        const id = (0, crypto_1.randomUUID)();
        this.wootgump[id] = new playcanvas_1.Vec2(position.x, position.z);
        this.state.wootgump.set(id, new DelphsTableState_1.Vec2().assign(position));
    }
    checkForHarvest() {
        Object.values(this.warriors).forEach((w) => {
            Object.keys(this.wootgump).forEach((gumpId) => {
                if (w.position.distance(this.wootgump[gumpId]) < 0.7) {
                    w.incGumpBalance(1);
                    delete this.wootgump[gumpId];
                    this.state.wootgump.delete(gumpId);
                }
            });
        });
    }
    spawnGump() {
        const allGumps = Object.values(this.wootgump);
        if (allGumps.length >= 100) {
            return;
        }
        allGumps.forEach((gump, i) => {
            if ((0, randoms_1.randomInt)(100) <= 5) {
                const xDiff = (0, randoms_1.randomBounded)(6);
                const zDiff = (0, randoms_1.randomBounded)(6);
                this.spawnOneGump({ x: gump.x + xDiff, z: gump.y + zDiff });
            }
        });
        // now let's see if we get a new area too
        if ((0, randoms_1.randomInt)(100) <= 10) {
            this.spawnOneGump(this.randomPosition());
        }
    }
    spawnTree(position) {
        const id = (0, crypto_1.randomUUID)();
        this.trees[id] = position;
        this.state.trees.set(id, new DelphsTableState_1.Vec2().assign({ x: position.x, z: position.y }));
    }
    randomPosition() {
        return {
            x: (0, randoms_1.randomBounded)(38),
            z: (0, randoms_1.randomBounded)(38),
        };
    }
}
exports.default = DelphsTableLogic;
