"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelphsTableState = exports.Player = exports.MaxStats = exports.Quest = exports.QuestObject = exports.DeerAttack = exports.Battle = exports.Warrior = exports.Deer = exports.Trap = exports.InventoryOfItem = exports.Item = exports.Vec2 = exports.Music = exports.QuestType = exports.QuestObjectKind = exports.State = exports.RoomType = void 0;
const schema_1 = require("@colyseus/schema");
var RoomType;
(function (RoomType) {
    RoomType[RoomType["continuous"] = 0] = "continuous";
    RoomType[RoomType["match"] = 1] = "match";
})(RoomType = exports.RoomType || (exports.RoomType = {}));
var State;
(function (State) {
    State[State["move"] = 0] = "move";
    State[State["harvest"] = 1] = "harvest";
    State[State["battle"] = 2] = "battle";
    State[State["dead"] = 3] = "dead";
    State[State["taunt"] = 4] = "taunt";
    State[State["chasing"] = 5] = "chasing";
    State[State["deerAttack"] = 6] = "deerAttack";
})(State = exports.State || (exports.State = {}));
var QuestObjectKind;
(function (QuestObjectKind) {
    QuestObjectKind[QuestObjectKind["chest"] = 0] = "chest";
})(QuestObjectKind = exports.QuestObjectKind || (exports.QuestObjectKind = {}));
var QuestType;
(function (QuestType) {
    QuestType[QuestType["first"] = 0] = "first";
    QuestType[QuestType["timed"] = 1] = "timed";
    QuestType[QuestType["keyCarrier"] = 2] = "keyCarrier";
    QuestType[QuestType["random"] = 3] = "random";
})(QuestType = exports.QuestType || (exports.QuestType = {}));
class Music extends schema_1.Schema {
}
__decorate([
    (0, schema_1.type)("string")
], Music.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("string")
], Music.prototype, "url", void 0);
__decorate([
    (0, schema_1.type)("number")
], Music.prototype, "duration", void 0);
__decorate([
    (0, schema_1.type)("number")
], Music.prototype, "startedAt", void 0);
__decorate([
    (0, schema_1.type)("string")
], Music.prototype, "description", void 0);
__decorate([
    (0, schema_1.type)("string")
], Music.prototype, "artwork", void 0);
exports.Music = Music;
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
    (0, schema_1.type)("number")
], Item.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string")
], Item.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("string")
], Item.prototype, "description", void 0);
__decorate([
    (0, schema_1.type)("number")
], Item.prototype, "costToPlay", void 0);
exports.Item = Item;
class InventoryOfItem extends schema_1.Schema {
}
__decorate([
    (0, schema_1.type)(Item)
], InventoryOfItem.prototype, "item", void 0);
__decorate([
    (0, schema_1.type)("number")
], InventoryOfItem.prototype, "quantity", void 0);
exports.InventoryOfItem = InventoryOfItem;
class Trap extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.position = new Vec2();
    }
}
__decorate([
    (0, schema_1.type)("string")
], Trap.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)(Vec2)
], Trap.prototype, "position", void 0);
__decorate([
    (0, schema_1.type)("string")
], Trap.prototype, "plantedBy", void 0);
exports.Trap = Trap;
class Deer extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.position = new Vec2();
        this.destination = new Vec2();
        this.state = 0;
        this.speed = 0;
    }
}
__decorate([
    (0, schema_1.type)("string")
], Deer.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)(Vec2)
], Deer.prototype, "position", void 0);
__decorate([
    (0, schema_1.type)(Vec2)
], Deer.prototype, "destination", void 0);
__decorate([
    (0, schema_1.type)("number")
], Deer.prototype, "state", void 0);
__decorate([
    (0, schema_1.type)("number")
], Deer.prototype, "speed", void 0);
exports.Deer = Deer;
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
        this.bodyType = 0;
        this.color = new schema_1.ArraySchema();
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
], Warrior.prototype, "maxSpeed", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "currentAttack", void 0);
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "currentDefense", void 0);
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
__decorate([
    (0, schema_1.type)("number")
], Warrior.prototype, "bodyType", void 0);
__decorate([
    (0, schema_1.type)({ array: "number" })
], Warrior.prototype, "color", void 0);
exports.Warrior = Warrior;
class Battle extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.warriorIds = new schema_1.ArraySchema();
    }
}
__decorate([
    (0, schema_1.type)("string")
], Battle.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)({ array: "string" })
], Battle.prototype, "warriorIds", void 0);
exports.Battle = Battle;
class DeerAttack extends schema_1.Schema {
}
__decorate([
    (0, schema_1.type)("string")
], DeerAttack.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string")
], DeerAttack.prototype, "warriorId", void 0);
__decorate([
    (0, schema_1.type)("string")
], DeerAttack.prototype, "deerId", void 0);
exports.DeerAttack = DeerAttack;
class QuestObject extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.position = new Vec2();
    }
}
__decorate([
    (0, schema_1.type)("string")
], QuestObject.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("number")
], QuestObject.prototype, "kind", void 0);
__decorate([
    (0, schema_1.type)(Vec2)
], QuestObject.prototype, "position", void 0);
exports.QuestObject = QuestObject;
class Quest extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.kind = 0;
    }
}
__decorate([
    (0, schema_1.type)("number")
], Quest.prototype, "startedAt", void 0);
__decorate([
    (0, schema_1.type)("number")
], Quest.prototype, "kind", void 0);
__decorate([
    (0, schema_1.type)(QuestObject)
], Quest.prototype, "object", void 0);
__decorate([
    (0, schema_1.type)("string")
], Quest.prototype, "piggyId", void 0);
exports.Quest = Quest;
class MaxStats extends schema_1.Schema {
}
__decorate([
    (0, schema_1.type)("number")
], MaxStats.prototype, "maxAttack", void 0);
__decorate([
    (0, schema_1.type)("number")
], MaxStats.prototype, "maxDefense", void 0);
__decorate([
    (0, schema_1.type)("number")
], MaxStats.prototype, "maxHealth", void 0);
exports.MaxStats = MaxStats;
class Player extends schema_1.Schema {
}
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "token", void 0);
exports.Player = Player;
class DelphsTableState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.tick = 0;
        this.roomType = RoomType.continuous;
        this.persistantMessage = "";
        this.questActive = false;
        this.maxStats = new MaxStats({});
        this.expectedPlayers = new schema_1.ArraySchema();
        this.warriors = new schema_1.MapSchema({});
        this.battles = new schema_1.MapSchema({});
        this.deerAttacks = new schema_1.MapSchema({});
        this.wootgump = new schema_1.MapSchema({});
        this.trees = new schema_1.MapSchema({});
        this.deer = new schema_1.MapSchema({});
        this.traps = new schema_1.MapSchema({});
        this.nowPlaying = new Music({});
    }
}
__decorate([
    (0, schema_1.type)("number")
], DelphsTableState.prototype, "tick", void 0);
__decorate([
    (0, schema_1.type)("number")
], DelphsTableState.prototype, "roomType", void 0);
__decorate([
    (0, schema_1.type)("string")
], DelphsTableState.prototype, "matchId", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], DelphsTableState.prototype, "acceptInput", void 0);
__decorate([
    (0, schema_1.type)("string")
], DelphsTableState.prototype, "persistantMessage", void 0);
__decorate([
    (0, schema_1.type)("string")
], DelphsTableState.prototype, "seed", void 0);
__decorate([
    (0, schema_1.type)(Quest)
], DelphsTableState.prototype, "currentQuest", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], DelphsTableState.prototype, "questActive", void 0);
__decorate([
    (0, schema_1.type)(MaxStats)
], DelphsTableState.prototype, "maxStats", void 0);
__decorate([
    (0, schema_1.type)({ array: Player })
], DelphsTableState.prototype, "expectedPlayers", void 0);
__decorate([
    (0, schema_1.type)({ map: Warrior })
], DelphsTableState.prototype, "warriors", void 0);
__decorate([
    (0, schema_1.type)({ map: Battle })
], DelphsTableState.prototype, "battles", void 0);
__decorate([
    (0, schema_1.type)({ map: DeerAttack })
], DelphsTableState.prototype, "deerAttacks", void 0);
__decorate([
    (0, schema_1.type)({ map: Vec2 })
], DelphsTableState.prototype, "wootgump", void 0);
__decorate([
    (0, schema_1.type)({ map: Vec2 })
], DelphsTableState.prototype, "trees", void 0);
__decorate([
    (0, schema_1.type)({ map: Deer })
], DelphsTableState.prototype, "deer", void 0);
__decorate([
    (0, schema_1.type)({ map: Trap })
], DelphsTableState.prototype, "traps", void 0);
__decorate([
    (0, schema_1.type)(Music)
], DelphsTableState.prototype, "nowPlaying", void 0);
exports.DelphsTableState = DelphsTableState;
