"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemFromInventoryItem = exports.defaultInitialInventory = exports.itemsByIdentifier = exports.getIdentifier = void 0;
function getIdentifier(item) {
    return `${item.address}-${item.id}`;
}
exports.getIdentifier = getIdentifier;
const zeroAddr = '0x0000000000000000000000000000000000000000';
const items = [
    {
        address: zeroAddr,
        id: 1,
        name: "Trap",
        description: "Drop a trap on the board.",
        costToPlay: 5,
        appliesToWorld: true
    },
    {
        address: zeroAddr,
        id: 2,
        name: "Berserk",
        description: 'Gives your warrior +2000 attack at the cost of 400 defense and 100 health points.',
        attack: 2000,
        defense: -400,
        hp: -100,
        costToPlay: 20,
    },
    {
        address: zeroAddr,
        id: 3,
        name: "Speed",
        description: "Increase the speed of your player for 15s.",
        costToPlay: 10,
        speed: 2,
        timeLimit: 15,
    }
].map((i) => {
    return Object.assign({ identifier: getIdentifier(i) }, i);
});
exports.itemsByIdentifier = items.reduce((memo, item) => {
    return Object.assign({ [item.identifier]: item }, memo);
}, {});
exports.defaultInitialInventory = {
    [items[0].identifier]: { quantity: 20, item: { address: items[0].address, id: items[0].id } },
    [items[1].identifier]: { quantity: 20, item: { address: items[1].address, id: items[1].id } },
    [items[2].identifier]: { quantity: 20, item: { address: items[2].address, id: items[2].id } },
};
function itemFromInventoryItem(inventoryItem) {
    const identifier = getIdentifier(inventoryItem);
    return exports.itemsByIdentifier[identifier];
}
exports.itemFromInventoryItem = itemFromInventoryItem;
exports.default = items;
