import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";

/**
 * Import your Room files
 */
import express from 'express'
import { DelphsTable } from "./rooms/DelphsTable";
import { RoomType } from "./rooms/schema/DelphsTableState";

export default Arena({
    getId: () => "Delph's Table",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('delphs', DelphsTable, { roomType: RoomType.continuous });
        gameServer.define('match', DelphsTable, { roomType: RoomType.match }).filterBy(["matchId"]);
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
        app.use("/colyseus", monitor());
        app.use(express.json())
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});