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
const debug_1 = __importDefault(require("debug"));
const items_1 = __importStar(require("./items"));
const randoms_1 = require("./utils/randoms");
const DelphsTableState_1 = require("../rooms/schema/DelphsTableState");
const playcanvas_1 = require("playcanvas");
const log = (0, debug_1.default)('Warrior');
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
            attack: (0, randoms_1.deterministicRandom)(1000, `generateFakeWarriors-${i}-attack`, seed),
            defense: (0, randoms_1.deterministicRandom)(800, `generateFakeWarriors-${i}-defense`, seed),
            initialHealth: (0, randoms_1.deterministicRandom)(2000, `generateFakeWarriors-${i}-health`, seed),
            initialGump: 0,
            initialInventory: {},
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
    constructor(state) {
        super();
        this.state = state;
        this.position = new playcanvas_1.Vec2(state.position.x, state.position.z);
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
    }
    incGumpBalance(amount) {
        this.state.wootgumpBalance += amount;
    }
    setSpeed(speed) {
        this.state.speed = speed;
    }
    setDestination(x, z) {
        this.state.destination.assign({
            x,
            z,
        });
        const dist = this.distanceToDestination();
        if (dist > 2) {
            this.setSpeed(4);
            return;
        }
        if (dist > 0.25) {
            this.setSpeed(2);
            return;
        }
        this.setSpeed(0);
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
            const amountToTopUp = this.state.currentHealth * -1;
            this.state.currentHealth = 0;
            return amountToTopUp;
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
        log('setting item: ', item, ' existing: ', this.state.currentItem);
        // find it in the inventory
        const inventoryRecord = this.state.inventory.get((0, items_1.getIdentifier)(item));
        if (!inventoryRecord || inventoryRecord.quantity <= 0) {
            console.error('no inventory left for this item, not playing');
            return;
        }
        inventoryRecord.quantity -= 1;
        this.currentItem = item;
    }
    currentItemDetails() {
        if (!this.currentItem) {
            return null;
        }
        return items_1.default.find((i) => i.address == this.currentItem.address && i.id == this.currentItem.id);
    }
    clearItem() {
        this.currentItem = undefined;
    }
}
exports.default = Warrior;
