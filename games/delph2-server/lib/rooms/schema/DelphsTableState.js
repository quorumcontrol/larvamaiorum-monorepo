"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelphsTableState = exports.Warrior = exports.InventoryOfItem = exports.Item = exports.Vec2 = exports.State = void 0;
const schema_1 = require("@colyseus/schema");
var State;
(function (State) {
    State[State["move"] = 0] = "move";
    State[State["harvest"] = 1] = "harvest";
    State[State["battle"] = 2] = "battle";
    State[State["dead"] = 3] = "dead";
    State[State["taunt"] = 4] = "taunt";
})(State = exports.State || (exports.State = {}));
class Vec2 extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.z = 0;
    }
}
__decorate([
    (0, schema_1.type)("number")
], Vec2.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number")
], Vec2.prototype, "z", void 0);
exports.Vec2 = Vec2;
class Item extends schema_1.Schema {
}
__decorate([
    (0, schema_1.type)("string")
], Item.prototype, "address", void 0);
__decorate([
    (0, schema_1.type)("string")
], Item.prototype, "id", void 0);
exports.Item = Item;
class InventoryOfItem extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.quantity = 0;
    }
}
__decorate([
    (0, schema_1.type)(Item)
], InventoryOfItem.prototype, "item", void 0);
__decorate([
    (0, schema_1.type)("number")
], InventoryOfItem.prototype, "quantity", void 0);
exports.InventoryOfItem = InventoryOfItem;
class Warrior extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.position = new Vec2();
        this.destination = new Vec2();
        this.state = 0;
        this.speed = 0;
        this.initialInventory = new schema_1.MapSchema({});
        this.inventory = new schema_1.MapSchema({});
        this.autoPlay = false;
    }
}
__decorate([
    (0, schema_1.type)(Vec2)
], Warrior.prototype, "position", void 0);
__decorate([
    (0, schema_1.type)(Vec2)
], Warrior.prototype, "destination", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "state", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "speed", void 0);
__decorate([
    (0, schema_1.type)("string")
], Warrior.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string")
], Warrior.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "attack", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "defense", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "initialHealth", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "currentHealth", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "initialGump", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "wootgumpBalance", void 0);
__decorate([
    (0, schema_1.type)({ map: InventoryOfItem })
], Warrior.prototype, "initialInventory", void 0);
__decorate([
    (0, schema_1.type)({ map: InventoryOfItem })
], Warrior.prototype, "inventory", void 0);
__decorate([
    (0, schema_1.type)(Item)
], Warrior.prototype, "currentItem", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Warrior.prototype, "autoPlay", void 0);
exports.Warrior = Warrior;
class DelphsTableState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.tick = 0;
        this.seed = "todo:initialseed";
        this.warriors = new schema_1.MapSchema({});
        this.wootgump = new schema_1.MapSchema({});
        this.trees = new schema_1.MapSchema({});
    }
}
__decorate([
    (0, schema_1.type)("number")
], DelphsTableState.prototype, "tick", void 0);
__decorate([
    (0, schema_1.type)("string")
], DelphsTableState.prototype, "seed", void 0);
__decorate([
    (0, schema_1.type)({ map: Warrior })
], DelphsTableState.prototype, "warriors", void 0);
__decorate([
    (0, schema_1.type)({ map: Vec2 })
], DelphsTableState.prototype, "wootgump", void 0);
__decorate([
    (0, schema_1.type)({ map: Vec2 })
], DelphsTableState.prototype, "trees", void 0);
exports.DelphsTableState = DelphsTableState;
