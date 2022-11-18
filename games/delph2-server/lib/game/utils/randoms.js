"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deterministicRandom = exports.deterministicBounded = exports.randomInt = exports.randomBounded = exports.randomFloat = void 0;
const crypto_1 = require("crypto");
const bn_js_1 = __importDefault(require("bn.js"));
function randomFloat() {
    return Math.random();
}
exports.randomFloat = randomFloat;
function deterministicNumber(id, seed) {
    const hash = (0, crypto_1.createHash)('sha256').update(`${id}-${seed}`).digest('hex');
    return new bn_js_1.default(hash, 'hex');
}
function randomBounded(size) {
    const negative = randomFloat() > 0.5;
    const rnd = randomFloat() * size;
    return negative ? rnd * -1 : rnd;
}
exports.randomBounded = randomBounded;
function randomInt(max) {
    return Math.floor(randomFloat() * max);
}
exports.randomInt = randomInt;
function deterministicBounded(size, id, seed) {
    const num = deterministicNumber(id, seed);
    let negative = false;
    if (num.mod(new bn_js_1.default(2)).toNumber() == 0) {
        negative = true;
    }
    // size can be a float and BigNumber doesn't like that so we first multiply it
    // then divide in javascript
    const rand = num.mod(new bn_js_1.default(Math.floor(size * 1000000))).toNumber() / 1000000;
    return negative ? rand * -1 : rand;
}
exports.deterministicBounded = deterministicBounded;
function deterministicRandom(max, id, seed) {
    if (max === 0) {
        return 0;
    }
    const num = deterministicNumber(id, seed);
    // use the absolute of max to make sure we always use a positive integer for a modulo
    const rand = num.mod(new bn_js_1.default(Math.abs(max))).toNumber();
    // make the number negative again if max is less than zero
    return max < 0 ? (rand * -1) : rand;
}
exports.deterministicRandom = deterministicRandom;
