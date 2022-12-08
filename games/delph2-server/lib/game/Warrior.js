"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFakeWarriors = void 0;
const events_1 = __importDefault(require("events"));
const items_1 = __importStar(require("./items"));
const randoms_1 = require("./utils/randoms");
const DelphsTableState_1 = require("../rooms/schema/DelphsTableState");
const playcanvas_1 = require("playcanvas");
const randomColor_1 = __importDefault(require("./utils/randomColor"));
const log = console.log; //debug('Warrior')
const berserkIdentifier = '0x0000000000000000000000000000000000000000-2';
// export interface WarriorState extends WarriorStats {
//   currentHealth: number;
//   wootgumpBalance: number;
//   location?: [number,number];
//   inventory: Inventory;
//   currentItem?: InventoryItem;
//   destination?: [number,number]
// }
function generateFakeWarriors(count, seed) {
    const warriors = [];
    for (let i = 0; i < count; i++) {
        warriors[i] = {
            id: `warrior-${i}-${seed}`,
            name: `Warius ${i}`,
            attack: (0, randoms_1.deterministicRandom)(1500, `generateFakeWarriors-${i}-attack`, seed) + 500,
            defense: (0, randoms_1.deterministicRandom)(500, `generateFakeWarriors-${i}-defense`, seed) + 400,
            initialHealth: (0, randoms_1.deterministicRandom)(1000, `generateFakeWarriors-${i}-health`, seed) + 1000,
            initialGump: 0,
            initialInventory: items_1.defaultInitialInventory,
            autoPlay: false,
        };
    }
    return warriors;
}
exports.generateFakeWarriors = generateFakeWarriors;
// function deepClone<T>(obj:T):T {
//   return JSON.parse(JSON.stringify(obj)) as T
// }
class Warrior extends events_1.default {
    // destination?: Vec3;
    constructor(client, state) {
        super();
        this.timeWithoutCard = 0;
        this.client = client;
        this.id = state.id;
        this.state = state;
        this.position = new playcanvas_1.Vec2(state.position.x, state.position.z);
        const color = (0, randomColor_1.default)({ format: 'rgbArray', seed: `playerColor-${this.id}`, luminosity: 'light' }).map((c) => c / 255);
        state.color.clear();
        state.color.push(...color);
    }
    update(dt) {
        if (this.state.state === DelphsTableState_1.State.move && this.state.speed > 0) {
            const current = new playcanvas_1.Vec2(this.state.position.x, this.state.position.z);
            const dest = new playcanvas_1.Vec2(this.state.destination.x, this.state.destination.z);
            const vector = new playcanvas_1.Vec2().sub2(dest, current).normalize().mulScalar(this.state.speed * dt);
            current.add(vector);
            this.state.position.assign({
                x: current.x,
                z: current.y,
            });
            this.position = current;
            const distance = current.distance(dest);
            if (distance <= 0.25) {
                this.setSpeed(0);
                return;
            }
            if (distance <= 2) {
                this.setSpeed(2);
                return;
            }
        }
        if (!this.state.currentItem && this.state.inventory.get(berserkIdentifier).quantity === 0) {
            this.timeWithoutCard += dt;
            if (this.timeWithoutCard > 45) {
                this.spawnBerserk();
            }
        }
    }
    spawnBerserk() {
        this.state.inventory.get(berserkIdentifier).quantity += 1;
        this.sendMessage('New Card!');
    }
    sendMessage(message) {
        console.log('send mainhudmessage', message);
        this.client.send('mainHUDMessage', message);
    }
    incGumpBalance(amount) {
        if (amount !== 0) {
            this.client.send('gumpDiff', amount);
        }
        this.state.wootgumpBalance += amount;
    }
    setSpeed(speed) {
        this.state.speed = speed;
    }
    setState(state) {
        this.state.state = state; // state state state statey state
        switch (state) {
            case DelphsTableState_1.State.move:
                this.setSpeedBasedOnDestination();
                return;
            case DelphsTableState_1.State.battle:
                this.setSpeed(0);
                return;
            case DelphsTableState_1.State.deerAttack:
                this.setSpeed(0);
                return;
        }
    }
    setSpeedBasedOnDestination() {
        const dist = this.distanceToDestination();
        if (dist > 1.5) {
            this.setSpeed(4);
            return;
        }
        if (dist > 0.25) {
            this.setSpeed(2);
            return;
        }
        this.setSpeed(0);
    }
    setDestination(x, z) {
        this.state.destination.assign({
            x,
            z,
        });
        this.setSpeedBasedOnDestination();
    }
    distanceToDestination() {
        return new playcanvas_1.Vec2(this.state.position.x, this.state.position.z).distance(new playcanvas_1.Vec2(this.state.destination.x, this.state.destination.z));
    }
    isAlive() {
        return this.state.currentHealth > 0;
    }
    currentAttack() {
        const item = this.currentItemDetails();
        if (!item) {
            return this.state.attack;
        }
        return this.state.attack + (item.attack || 0);
    }
    currentDefense() {
        const item = this.currentItemDetails();
        if (!item) {
            return this.state.defense;
        }
        return this.state.defense + (item.defense || 0);
    }
    // amount to add to health as a decimal percentage (ie 0.10 is 10%) of initialHealth
    recover(percentage) {
        if (this.state.currentHealth >= this.state.initialHealth) {
            return 0;
        }
        if (this.state.currentHealth < 0) {
            this.state.currentHealth = 0;
        }
        const amountToUp = Math.min(this.state.initialHealth * percentage, this.state.initialHealth - this.state.currentHealth);
        this.state.currentHealth += amountToUp;
        return amountToUp;
    }
    // randomItem(seed:string) {
    //   const available = Object.values(this.inventory).filter((i) => i.quantity > 0)
    //   if (available.length === 0) {
    //     return
    //   }
    //   const i = deterministicRandom(available.length - 1 , `${this.id}-${available.length}`, seed)
    //   this.setItem(available[i].item)
    // }
    setItem(item) {
        var _a;
        log('setting item: ', item, ' existing: ', (_a = this.state.currentItem) === null || _a === void 0 ? void 0 : _a.toJSON(), 'inventory', this.state.inventory.toJSON());
        // find it in the inventory
        const identifier = (0, items_1.getIdentifier)(item);
        log('identifier: ', identifier);
        const inventoryRecord = this.state.inventory.get(identifier);
        log('record: ', inventoryRecord === null || inventoryRecord === void 0 ? void 0 : inventoryRecord.toJSON());
        if (!inventoryRecord || inventoryRecord.quantity <= 0) {
            console.error('no inventory left for this item, not playing');
            return;
        }
        inventoryRecord.quantity -= 1;
        this.state.currentItem = new DelphsTableState_1.Item(item);
        this.state.currentAttack = this.currentAttack();
        this.state.currentDefense = this.currentDefense();
    }
    currentItemDetails() {
        if (!this.state.currentItem) {
            return null;
        }
        return items_1.default.find((i) => i.address == this.state.currentItem.address && i.id == this.state.currentItem.id);
    }
    clearItem() {
        this.state.currentItem = undefined;
        this.state.currentAttack = this.currentAttack();
        this.state.currentDefense = this.currentDefense();
        this.timeWithoutCard = 0;
    }
}
exports.default = Warrior;
