"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const randoms_1 = require("./utils/randoms");
const DelphsTableState_1 = require("../rooms/schema/DelphsTableState");
const playcanvas_1 = require("playcanvas");
class Deer extends events_1.default {
    constructor(state, wootgumps, warriors) {
        super();
        this.id = state.id;
        this.state = state;
        this.position = new playcanvas_1.Vec2(state.position.x, state.position.z);
        this.gumps = wootgumps;
        this.warriors = warriors;
        const gump = Object.values(wootgumps)[(0, randoms_1.randomInt)(Object.values(wootgumps).length - 1)];
        this.setDestination(gump.x, gump.y);
    }
    update(dt) {
        if ([DelphsTableState_1.State.move, DelphsTableState_1.State.chasing].includes(this.state.state) && this.state.speed > 0) {
            const current = new playcanvas_1.Vec2(this.state.position.x, this.state.position.z);
            const dest = new playcanvas_1.Vec2(this.state.destination.x, this.state.destination.z);
            const vector = new playcanvas_1.Vec2().sub2(dest, current).normalize().mulScalar(this.state.speed * dt);
            current.add(vector);
            this.state.position.assign({
                x: current.x,
                z: current.y,
            });
            this.position = current;
            this.setSpeedBasedOnDestination();
            this.updateDestination();
        }
    }
    updateDestination() {
        // if we're chasing, get distracted by gump.
        if (this.state.state === DelphsTableState_1.State.chasing) {
            const gump = this.nearbyGump();
            // if the player has played a card while chasing, then start ignoring them.
            if (this.chasing.state.currentItem) {
                this.stopChasing();
                const gumpOrRandom = gump || this.randomGump();
                if (gumpOrRandom) {
                    this.setDestination(gumpOrRandom.x, gumpOrRandom.y);
                }
            }
            if (gump && (0, randoms_1.randomInt)(1000) < 10) {
                console.log('stopping chasing to go after gump');
                this.stopChasing();
                this.setDestination(gump.x, gump.y);
                return;
            }
            if (this.chasing.state.state !== DelphsTableState_1.State.move) {
                this.stopChasing();
                const gump = this.nearbyGump() || this.randomGump();
                if (gump) {
                    this.setDestination(gump.x, gump.y);
                }
                return;
            }
            // otherwise set the destination of the warrior
            const position = this.chasing.position;
            console.log('distance to warrior: ', this.chasing.position.distance(position));
            this.setDestination(position.x, position.y);
            return;
        }
        // if we're going after a gump, go after warriors that smell good
        const nearbyWarrior = this.nearbyLoadedUpWarrior();
        if (nearbyWarrior && nearbyWarrior !== this.lastChased && (0, randoms_1.randomInt)(100) < 5) {
            console.log('nearby warrior: ', nearbyWarrior.state.name);
            nearbyWarrior.sendMessage("A reindeer is after you.");
            this.chasing = nearbyWarrior;
            this.setDestination(nearbyWarrior.position.x, nearbyWarrior.position.y);
            this.setState(DelphsTableState_1.State.chasing);
            return;
        }
        // otherwise let's just go where we're going until we get there
        const distance = this.position.distance(this.destination);
        if (distance <= 0.5) {
            this.lastChased = undefined;
            const gump = this.nearbyGump() || this.randomGump();
            if (gump) {
                this.setDestination(gump.x, gump.y);
            }
        }
    }
    stopChasing() {
        this.setState(DelphsTableState_1.State.move);
        this.lastChased = this.chasing;
        this.chasing = undefined;
    }
    randomGump() {
        return Object.values(this.gumps)[(0, randoms_1.randomInt)(Object.values(this.gumps).length)];
    }
    nearbyGump() {
        const eligible = Object.values(this.gumps).filter((gump) => {
            return this.position.distance(gump) < 5;
        });
        return eligible[(0, randoms_1.randomInt)(eligible.length)];
    }
    nearbyLoadedUpWarrior() {
        return Object.values(this.warriors).find((warrior) => {
            return warrior.state.wootgumpBalance > 10 &&
                this.position.distance(warrior.position) < 6 &&
                !warrior.state.currentItem;
        });
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
            case DelphsTableState_1.State.chasing:
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
        if (this.state.state === DelphsTableState_1.State.chasing && dist > 0.5) {
            this.setSpeed(4.15);
            return;
        }
        if (dist > 2) {
            this.setSpeed(4);
            return;
        }
        if (dist > 0.25) {
            this.setSpeed(1);
            return;
        }
        this.setSpeed(0);
    }
    setDestination(x, z) {
        this.state.destination.assign({
            x,
            z,
        });
        this.destination = new playcanvas_1.Vec2(x, z);
        this.setSpeedBasedOnDestination();
    }
    distanceToDestination() {
        return new playcanvas_1.Vec2(this.state.position.x, this.state.position.z).distance(new playcanvas_1.Vec2(this.state.destination.x, this.state.destination.z));
    }
}
exports.default = Deer;
