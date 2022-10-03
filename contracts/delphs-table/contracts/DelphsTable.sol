//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./interfaces/IDiceRoller.sol";

contract DelphsTable is AccessControl, ERC2771Context {
    error NoTwoRollsPerBlock();
    error Unauthorized();
    error AlreadyExists();
    error AlreadyStarted();
    error CantCreateAlreadyStarted();

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event DiceRolled(
        uint256 indexed index,
        uint256 indexed blockNumber,
        bytes32 random
    );
    event Started(bytes32 indexed id, uint256 indexed roll);
    event TableCreated(bytes32 indexed id);

    IDiceRoller public immutable roller;

    uint256 public latestRoll;
    mapping(uint256 => bytes32) public rolls;
    mapping(uint256 => uint256) public blockOfRoll;

    mapping(bytes32 => mapping(uint256 => Destination[])) public destinations;
    mapping(bytes32 => mapping(uint256 => ItemPlay[])) public itemPlays;

    mapping(bytes32 => Table) public tables;

    struct Destination {
        address player;
        int64 x;
        int64 y;
    }

    struct ItemPlay {
        address player;
        address itemContract;
        uint256 id;
    }

    struct Table {
        bytes32 id;
        address owner;
        uint256 startedAt; // the roll number started at
        uint256 gameLength; // number of rolls to play
        uint32 tableSize;
        uint32 wootgumpMultiplier; // base chance of spawning, per 1000 (basis points);
        address[] players;
        bytes32[] seeds;
        bytes32[] attributes;
        uint256[] initialGump;
    }

    struct Stats {
        uint256 attack;
        uint256 defense;
        uint256 health;
    }

    constructor(
        address trustedForwarder,
        address diceRollerAddress,
        address initialOwner
    ) ERC2771Context(trustedForwarder) {
        roller = IDiceRoller(diceRollerAddress);
        _setupRole(ADMIN_ROLE, initialOwner);
        _setupRole(DEFAULT_ADMIN_ROLE, initialOwner);
    }

    function rollTheDice() public returns (uint256) {
        if (blockOfRoll[latestRoll] == block.number) {
            revert NoTwoRollsPerBlock();
        }
        bytes32 rnd = roller.getRandom();
        rolls[latestRoll + 1] = rnd;
        blockOfRoll[latestRoll + 1] = block.number;
        latestRoll++;
        emit DiceRolled(latestRoll, block.number, rnd);
        return latestRoll;
    }

    function createTable(Table calldata newTable) public {
        if (newTable.startedAt > 0) {
            revert CantCreateAlreadyStarted();
        }
        if (!hasRole(ADMIN_ROLE, _msgSender())) {
            revert Unauthorized();
        }
        if (tables[newTable.id].players.length > 0) {
            revert AlreadyExists();
        }
        tables[newTable.id] = newTable;
        emit TableCreated(newTable.id);
    }

    function createAndStart(Table calldata newTable) external {
        createTable(newTable);
        start(newTable.id);
    }

    function start(bytes32 id) public returns (uint256) {
        Table storage table = tables[id];
        if (_msgSender() != table.owner) {
            revert Unauthorized();
        }
        if (table.startedAt > 0) {
            revert AlreadyStarted();
        }
        uint256 firstRoll = latestRoll + 1;
        table.startedAt = firstRoll;
        emit Started(id, firstRoll);
        return firstRoll;
    }

    function players(bytes32 id) public view returns (address[] memory) {
        return tables[id].players;
    }

    function seeds(bytes32 id) public view returns (bytes32[] memory) {
        return tables[id].seeds;
    }

    function initialGump(bytes32 id) public view returns (uint256[] memory) {
        return tables[id].initialGump;
    }

    function attributes(bytes32 id) public view returns (bytes32[] memory) {
        return tables[id].attributes;
    }

    function statsForPlayer(bytes32 id, address playerAddress)
        public
        view
        returns (Stats memory)
    {
        Table storage table = tables[id];
        //use the roll from the start (which was unknown to the table starter)
        bytes32 rnd = rolls[table.startedAt];
        if (rnd == bytes32(0)) {
            revert("no stats yet");
        }

        return
            Stats({
                attack: determinsticRandom(
                    rnd,
                    abi.encodePacked(playerAddress, "a"),
                    1000
                ) + 500,
                defense: determinsticRandom(
                    rnd,
                    abi.encodePacked(playerAddress, "d"),
                    800
                ) + 200,
                health: determinsticRandom(
                    rnd,
                    abi.encodePacked(playerAddress, "h"),
                    600
                ) + 200
            });
    }

    function determinsticRandom(
        bytes32 seed,
        bytes memory additional,
        uint256 max
    ) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(seed, additional))) % max;
    }

    function destinationsForRoll(bytes32 id, uint256 roll)
        public
        view
        returns (Destination[] memory)
    {
        return destinations[id][roll];
    }

    function itemPlaysForRoll(bytes32 id, uint256 roll)
        public
        view
        returns (ItemPlay[] memory)
    {
        return itemPlays[id][roll];
    }

    function setDestination(
        bytes32 id,
        int64 x,
        int64 y
    ) public returns (bool) {
        address sender = _msgSender();
        Table storage table = tables[id];
        if (!includes(table.players, sender)) {
            revert Unauthorized();
        }

        destinations[id][latestRoll].push(
            Destination({x: x, y: y, player: sender})
        );

        return true;
    }

    function playItem(
        bytes32 tableId,
        address itemContract,
        uint256 itemId
    ) public returns (bool) {
        address sender = _msgSender();
        Table storage table = tables[tableId];
        if (!includes(table.players, sender)) {
            revert Unauthorized();
        }

        itemPlays[tableId][latestRoll].push(
            ItemPlay({
                player: sender,
                itemContract: itemContract,
                id: itemId
            })
        );

        return true;
    }

    function includes(address[] storage arry, address val)
        private
        view
        returns (bool)
    {
        uint256 len = arry.length;
        for (uint256 i = 0; i < len; i++) {
            if (arry[i] == val) {
                return true;
            }
        }
        return false;
    }

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }
}
