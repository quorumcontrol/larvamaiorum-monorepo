"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const playcanvas_1 = require("playcanvas");
const DelphsTableState_1 = require("../rooms/schema/DelphsTableState");
const BattleLogic_1 = __importDefault(require("./BattleLogic"));
const Deer_1 = __importDefault(require("./Deer"));
const DeerAttackLogic_1 = __importDefault(require("./DeerAttackLogic"));
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
        this.battles = {};
        this.deer = {};
        this.deerAttacks = {};
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
        for (let i = 0; i < 10; i++) {
            const position = this.randomPosition();
            this.spawnDeer(new playcanvas_1.Vec2(position.x, position.z));
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
        Object.values(this.deer).forEach((d) => {
            d.update(dt);
        });
        this.spawnGump();
        this.checkForHarvest();
        this.handleBattles(dt);
        this.handleDeerAttacks(dt);
    }
    addWarrior(sessionId, stats) {
        console.log('add warrior', stats);
        const position = this.randomPosition();
        const state = new DelphsTableState_1.Warrior(Object.assign(Object.assign({}, stats), { id: sessionId, speed: 0, wootgumpBalance: stats.initialGump, currentHealth: stats.initialHealth }));
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
        // let the deer feed first
        Object.values(this.deer).forEach((deer) => {
            Object.keys(this.wootgump).forEach((gumpId) => {
                if (deer.position.distance(this.wootgump[gumpId]) < 0.7) {
                    delete this.wootgump[gumpId];
                    this.state.wootgump.delete(gumpId);
                }
            });
        });
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
    handleBattles(dt) {
        const pairs = [];
        const warriors = Object.values(this.warriors);
        warriors.forEach((w) => {
            if (this.battles[w.id]) {
                return;
            }
            // otherwise find warriors we should battle
            warriors.forEach((potentialOpponent) => {
                if (potentialOpponent.id === w.id) {
                    return;
                }
                if (w.position.distance(potentialOpponent.position) < 1) {
                    pairs.push([w, potentialOpponent]);
                }
            });
        });
        pairs.forEach((pair) => {
            if (pair.some((w) => this.battles[w.id])) {
                return; // if any pair is already in battle, then skip
            }
            const id = (0, crypto_1.randomUUID)();
            const state = new DelphsTableState_1.Battle({
                id
            });
            state.warriorIds.push(...pair.map((p) => p.id));
            // otherwise setup a battle
            const battle = new BattleLogic_1.default(id, pair, state);
            pair.forEach((w) => {
                this.battles[w.id] = battle;
            });
            this.state.battles.set(id, battle.state);
        });
        // start them all
        new Set(Object.values(this.battles)).forEach((battle) => {
            battle.update(dt); // update first so that new battles that are not started can ignore the time
            battle.go();
            if (battle.completed) {
                console.log('battle complete');
                battle.warriors.forEach((w) => {
                    delete this.battles[w.id];
                });
                this.state.battles.delete(battle.id);
            }
        });
    }
    handleDeerAttacks(dt) {
        const eligibleDeer = Object.values(this.deer).filter((d) => [DelphsTableState_1.State.move, DelphsTableState_1.State.chasing].includes(d.state.state));
        const eligibleWarriors = Object.values(this.warriors).filter((w) => w.state.state === DelphsTableState_1.State.move);
        eligibleDeer.forEach((deer) => {
            eligibleWarriors.forEach((w) => {
                // skip over already assigned warriors
                if (w.state.state !== DelphsTableState_1.State.move) {
                    return;
                }
                if (deer.position.distance(w.position) <= 0.6) {
                    console.log('deer close, setting up attack');
                    const id = (0, crypto_1.randomUUID)();
                    const attackState = new DelphsTableState_1.DeerAttack({
                        id,
                        warriorId: w.id,
                        deerId: deer.id
                    });
                    this.state.deerAttacks.set(id, attackState);
                    const attack = new DeerAttackLogic_1.default(id, deer, w);
                    this.deerAttacks[id] = attack;
                    attack.go();
                }
            });
        });
        Object.values(this.deerAttacks).forEach((attack) => {
            attack.update(dt);
            if (attack.complete) {
                this.state.deerAttacks.delete(attack.id);
                delete this.deerAttacks[attack.id];
            }
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
    spawnDeer(position) {
        const id = (0, crypto_1.randomUUID)();
        const deerState = new DelphsTableState_1.Deer();
        deerState.position.assign({
            x: position.x,
            z: position.y
        });
        const deer = new Deer_1.default(deerState, this.wootgump, this.warriors);
        this.deer[id] = deer;
        this.state.deer.set(id, deerState);
    }
    randomPosition() {
        return {
            x: (0, randoms_1.randomBounded)(38),
            z: (0, randoms_1.randomBounded)(38),
        };
    }
}
exports.default = DelphsTableLogic;
