"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arena_1 = __importDefault(require("@colyseus/arena"));
const monitor_1 = require("@colyseus/monitor");
/**
 * Import your Room files
 */
const express_1 = __importDefault(require("express"));
const DelphsTable_1 = require("./rooms/DelphsTable");
const DelphsTableState_1 = require("./rooms/schema/DelphsTableState");
exports.default = (0, arena_1.default)({
    getId: () => "Delph's Table",
    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('delphs', DelphsTable_1.DelphsTable, { roomType: DelphsTableState_1.RoomType.continuous });
        gameServer.define('match', DelphsTable_1.DelphsTable, { roomType: DelphsTableState_1.RoomType.match }).filterBy(["matchId"]);
    },
    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (_req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", (0, monitor_1.monitor)());
        app.use(express_1.default.json());
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
