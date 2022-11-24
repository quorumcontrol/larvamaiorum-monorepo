"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DelphsTableState_1 = require("../rooms/schema/DelphsTableState");
class DeerAttackLogic {
    constructor(id, deer, warrior) {
        this.started = false;
        this.over = false;
        this.complete = false;
        this.clock = 0;
        this.id = id;
        this.deer = deer;
        this.warrior = warrior;
    }
    go() {
        if (this.started) {
            return;
        }
        this.started = true;
        this.deer.setState(DelphsTableState_1.State.deerAttack);
        this.warrior.setState(DelphsTableState_1.State.deerAttack);
    }
    update(dt) {
        if (!this.started || this.complete) {
            return;
        }
        this.clock += dt;
        // 3 seconds later, let the player run free but take 25% of their gump
        if (this.clock > 3 && !this.over) {
            this.over = true;
            this.warrior.setState(DelphsTableState_1.State.move);
            this.warrior.incGumpBalance(-1 * Math.floor(this.warrior.state.wootgumpBalance * 0.25));
            return;
        }
        // let the deer graze for 4 seconds before chasing the player again
        if (this.clock > 7 && !this.complete) {
            this.complete = true;
            this.deer.setState(DelphsTableState_1.State.move);
        }
    }
}
exports.default = DeerAttackLogic;
