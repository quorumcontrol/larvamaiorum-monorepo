"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DelphsTableState_1 = require("../rooms/schema/DelphsTableState");
const randoms_1 = require("./utils/randoms");
class BattleLogic {
    constructor(id, warriors, state) {
        this.started = false;
        this.clock = 0;
        this.over = false;
        this.completed = false;
        this.wootgumpPot = 0;
        this.id = id;
        this.warriors = warriors;
        this.state = state;
    }
    update(dt) {
        if (!this.started) {
            return;
        }
        this.clock += dt;
        if (this.clock > 1 && !this.over) {
            if (!this.over) {
                return this.endIt();
            }
        }
        if (this.clock > 5 && !this.completed) {
            console.log('completing battle');
            this.warriors.forEach((b, i) => {
                if (!b.isAlive()) {
                    b.recover(1.00);
                }
                console.log('recovering warrior: ', b.id);
                b.setState(DelphsTableState_1.State.move);
            });
            this.completed = true;
        }
    }
    endIt() {
        const warriors = this.warriors;
        while (!warriors.some((w) => !w.isAlive())) {
            const attackerIdx = (0, randoms_1.randomFloat)() >= 0.5 ? 0 : 1;
            const attacker = warriors[attackerIdx];
            const defender = warriors[(attackerIdx + 1) % this.warriors.length];
            const attackRoll = (0, randoms_1.randomInt)(attacker.currentAttack());
            const defenseRoll = (0, randoms_1.randomInt)(defender.currentDefense());
            if (attackRoll > defenseRoll) {
                defender.state.currentHealth -= (attackRoll - defenseRoll);
            }
        }
        warriors.forEach((warrior, i) => {
            warrior.clearItem();
            if (warrior.isAlive()) {
                warrior.sendMessage("Winner!");
                warrior.setState(DelphsTableState_1.State.move);
            }
            else {
                warrior.sendMessage('You lose.');
                const gumpTaken = Math.floor(warrior.state.wootgumpBalance * 0.5);
                warrior.incGumpBalance(gumpTaken * -1);
                warriors[(i + 1) % warriors.length].incGumpBalance(gumpTaken);
                warrior.setState(DelphsTableState_1.State.dead);
            }
        });
        this.over = true;
        this.clock = 0;
    }
    go() {
        if (this.started) {
            return;
        }
        console.log('battle started');
        this.started = true;
        this.setBattling();
    }
    setBattling() {
        this.warriors.forEach((w, i) => {
            w.setState(DelphsTableState_1.State.battle);
            w.sendMessage('Battle!');
        });
    }
}
exports.default = BattleLogic;
