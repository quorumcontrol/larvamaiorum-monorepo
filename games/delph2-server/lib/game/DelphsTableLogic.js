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
const crypto_1 = require("crypto");
const playcanvas_1 = require("playcanvas");
const DelphsTableState_1 = require("../rooms/schema/DelphsTableState");
const BattleLogic_1 = __importDefault(require("./BattleLogic"));
const Deer_1 = __importDefault(require("./Deer"));
const DeerAttackLogic_1 = __importDefault(require("./DeerAttackLogic"));
const items_1 = require("./items");
const music_1 = require("./music");
const QuestLogic_1 = __importDefault(require("./QuestLogic"));
const iterableToArray_1 = __importDefault(require("./utils/iterableToArray"));
const randoms_1 = require("./utils/randoms");
const Warrior_1 = __importDefault(require("./Warrior"));
class DelphsTableLogic {
    // for now assume a blank table at construction
    // TODO: handle a populated state with existing warriors, etc
    constructor(room) {
        this.timeSinceMusic = 0;
        this.timeSinceLastQuest = 0;
        this.playerQuorumHasArrived = false;
        this.room = room;
        this.state = room.state;
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
            const now = new Date();
            const diff = (now.getTime()) - previous.getTime();
            previous = now;
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
        if (this.state.roomType === DelphsTableState_1.RoomType.continuous) {
            this.state.assign({
                acceptInput: true
            });
        }
        this.setupMusic();
    }
    setupMusic() {
        return __awaiter(this, void 0, void 0, function* () {
            const track = yield (0, music_1.getRandomTrack)();
            if (track) {
                console.log('updating track to: ', track.title);
                this.state.nowPlaying.assign({
                    name: track.title,
                    duration: track.duration,
                    artwork: track.artwork,
                    url: track.streaming,
                    startedAt: new Date().getTime()
                });
            }
            this.timeSinceMusic = 0;
        });
    }
    stop() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
    }
    update(dt) {
        var _a;
        Object.values(this.warriors).forEach((w) => {
            w.update(dt);
        });
        Object.values(this.deer).forEach((d) => {
            d.update(dt);
        });
        this.checkForPlayers();
        this.checkForTraps();
        this.spawnGump();
        this.checkForHarvest();
        this.handleBattles(dt);
        this.handleDeerAttacks(dt);
        this.handleRecovers(dt);
        this.timeSinceMusic += dt;
        if (this.state.nowPlaying.duration === 0 && this.timeSinceMusic > 20) {
            // try every 20s incase music is failing
            this.timeSinceMusic = 0;
            this.setupMusic();
        }
        if (this.state.nowPlaying.duration > 0 && this.timeSinceMusic > this.state.nowPlaying.duration) {
            this.timeSinceMusic = 0;
            this.setupMusic();
        }
        if (this.currentQuest) {
            this.currentQuest.update(dt);
        }
        if (!this.currentQuest && this.state.acceptInput) {
            this.timeSinceLastQuest += dt;
        }
        if (this.state.acceptInput && !this.state.currentQuest && this.timeSinceLastQuest > 60 && (this.isMatchRoom() || Math.floor(this.timeSinceLastQuest) % 10 === 0 && (0, randoms_1.randomInt)(10) === 1)) {
            this.startQuest();
        }
        if ((_a = this.currentQuest) === null || _a === void 0 ? void 0 : _a.isOver()) {
            this.stopQuest();
        }
    }
    isMatchRoom() {
        return this.state.roomType === DelphsTableState_1.RoomType.match;
    }
    checkForPlayers() {
        if (this.state.roomType === DelphsTableState_1.RoomType.continuous || this.playerQuorumHasArrived) {
            return;
        }
        const expectedPlayers = (0, iterableToArray_1.default)(this.state.expectedPlayers.values());
        if (Object.values(this.warriors).length < expectedPlayers.length) {
            this.state.assign({
                acceptInput: false,
                persistantMessage: "Waiting for players."
            });
            return;
        }
        this.playerQuorumHasArrived = true;
        this.state.assign({
            acceptInput: true,
            persistantMessage: "",
        });
    }
    addWarrior(client, stats) {
        console.log('add warrior', stats);
        const sessionId = client.sessionId;
        const position = this.randomPosition();
        const state = new DelphsTableState_1.Warrior(Object.assign(Object.assign({}, stats), { currentAttack: stats.attack, currentDefense: stats.defense, id: sessionId, speed: 0, wootgumpBalance: stats.initialGump, currentHealth: stats.initialHealth }));
        state.position.assign(position);
        state.destination.assign(position);
        Object.keys(stats.initialInventory).forEach((key) => {
            const initialInventory = stats.initialInventory[key];
            const itemDescription = (0, items_1.itemFromInventoryItem)(initialInventory.item);
            const item = new DelphsTableState_1.Item(Object.assign(Object.assign({}, initialInventory.item), itemDescription));
            const inventoryOfItem = new DelphsTableState_1.InventoryOfItem({ quantity: initialInventory.quantity, item: item });
            state.initialInventory.set(key, inventoryOfItem);
            state.inventory.set(key, inventoryOfItem.clone());
        });
        console.log('added warrior: ', state.name);
        this.warriors[sessionId] = new Warrior_1.default(client, state);
        this.state.warriors.set(sessionId, state);
        this.updateMaxStats();
    }
    removeWarrior(client) {
        const sessionId = client.sessionId;
        delete this.warriors[sessionId];
        this.state.warriors.delete(sessionId);
        if (this.currentQuest && this.currentQuest.state.piggyId === sessionId) {
            console.log('warrior leaving was the piggy');
            this.currentQuest.setNewRandomPiggy();
        }
        this.updateMaxStats();
    }
    updateDestination(sessionId, { x, z }) {
        if (!this.state.acceptInput) {
            return;
        }
        this.warriors[sessionId].setDestination(x, z);
    }
    playCard(sessionId, item) {
        var _a;
        if (!this.state.acceptInput) {
            return;
        }
        const result = (_a = this.warriors[sessionId]) === null || _a === void 0 ? void 0 : _a.playItem(item);
        if ((result === null || result === void 0 ? void 0 : result.name) === "Trap") {
            this.setTrap(sessionId);
        }
    }
    setTrap(sessionId) {
        if (!this.state.acceptInput) {
            return;
        }
        const warrior = this.warriors[sessionId];
        if (!warrior) {
            return;
        }
        if ((0, iterableToArray_1.default)(this.state.traps.values()).length > 50) {
            warrior.sendMessage("No more traps allowed");
            return;
        }
        const id = (0, crypto_1.randomUUID)();
        const trap = new DelphsTableState_1.Trap({
            id,
            plantedBy: sessionId,
        });
        trap.position.assign({ x: warrior.position.x, z: warrior.position.y });
        this.state.traps.set(id, trap);
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
    checkForTraps() {
        Object.values(this.warriors).forEach((w) => {
            for (const [id, trap] of this.state.traps.entries()) {
                if (trap.plantedBy === w.id) {
                    return;
                }
                const distance = w.position.distance(new playcanvas_1.Vec2(trap.position.x, trap.position.z));
                if (distance < 3) {
                    console.log(w.state.name, 'trapped');
                    w.state.assign({
                        currentHealth: w.state.currentHealth * 0.5
                    });
                    const gumpToLose = Math.floor(w.state.wootgumpBalance * 0.1);
                    w.incGumpBalance(-1 * gumpToLose);
                    if (trap.plantedBy && this.warriors[trap.plantedBy]) {
                        this.warriors[trap.plantedBy].incGumpBalance(gumpToLose);
                    }
                    if (this.currentQuest && this.currentQuest.state.piggyId === w.id) {
                        this.currentQuest.updatePiggy(trap.plantedBy);
                    }
                    // w.client.send('trapped', id)
                    this.state.traps.delete(id);
                }
            }
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
                if (this.currentQuest && this.currentQuest.state.piggyId) {
                    const piggyId = this.currentQuest.state.piggyId;
                    const winner = battle.winner;
                    if (winner.id === piggyId) {
                        return; // do nothing because the winner stays the piggy.
                    }
                    battle.losers.forEach((w) => {
                        if (w.id === piggyId) {
                            this.currentQuest.updatePiggy(winner.id);
                        }
                    });
                }
            }
        });
    }
    handleRecovers(_dt) {
        Object.values(this.warriors).forEach((w) => {
            if (w.state.state === DelphsTableState_1.State.move) {
                w.recover(0.005);
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
    updateMaxStats() {
        let maxAttack = 0;
        let maxDefense = 0;
        let maxHealth = 0;
        Object.values(this.warriors).forEach((w) => {
            if (w.state.attack > maxAttack) {
                maxAttack = w.state.attack;
            }
            if (w.state.defense > maxDefense) {
                maxDefense = w.state.defense;
            }
            if (w.state.initialHealth > maxHealth) {
                maxHealth = w.state.initialHealth;
            }
        });
        this.state.maxStats.assign({
            maxAttack,
            maxDefense,
            maxHealth,
        });
    }
    startQuest() {
        const type = (this.state.roomType === DelphsTableState_1.RoomType.continuous) ? DelphsTableState_1.QuestType.random : DelphsTableState_1.QuestType.keyCarrier;
        const quest = QuestLogic_1.default.randomQuest(this.room, this.warriors, type);
        this.currentQuest = quest;
        this.state.assign({
            questActive: true,
            currentQuest: quest.state,
        });
        quest.start();
    }
    stopQuest() {
        const winner = this.currentQuest.winner;
        this.currentQuest = undefined;
        this.state.assign({
            questActive: false,
            currentQuest: undefined
        });
        this.timeSinceLastQuest = 0;
        if (this.isMatchRoom()) {
            this.state.assign({
                acceptInput: false,
                persistantMessage: `${winner.state.name} wins!`
            });
            return;
        }
        this.room.broadcast('mainHUDMessage', 'Quest Over');
        if (winner) {
            winner.client.send('mainHUDMessage', "You win!");
            Object.values(this.warriors).forEach((w) => {
                if (w === winner) {
                    return;
                }
                w.sendMessage("You lose.");
            });
        }
    }
    spawnGump() {
        const allGumps = Object.values(this.wootgump);
        if (allGumps.length >= 60) {
            return;
        }
        allGumps.forEach((gump, i) => {
            if ((0, randoms_1.randomInt)(100) <= 5) {
                const xDiff = (0, randoms_1.randomBounded)(6);
                const zDiff = (0, randoms_1.randomBounded)(6);
                const x = this.positionModulo(gump.x + xDiff);
                const z = this.positionModulo(gump.y + zDiff);
                this.spawnOneGump({ x, z });
            }
        });
        // now let's see if we get a new area too
        if ((0, randoms_1.randomInt)(100) <= 10) {
            this.spawnOneGump(this.randomPosition());
        }
    }
    positionModulo(dimension) {
        if (dimension < 0 && dimension < 37) {
            return 36;
        }
        if (dimension > 37) {
            return dimension % 35;
        }
        return dimension;
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
        const deer = new Deer_1.default(deerState, this.wootgump, this.warriors, this.state.traps);
        this.deer[id] = deer;
        this.state.deer.set(id, deerState);
    }
    randomPosition() {
        return {
            x: (0, randoms_1.randomBounded)(37),
            z: (0, randoms_1.randomBounded)(37),
        };
    }
}
exports.default = DelphsTableLogic;
