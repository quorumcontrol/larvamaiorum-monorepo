/**
 * IMPORTANT: 
 * ---------
 * Do not manually edit this file if you'd like to use Colyseus Arena
 * 
 * If you're self-hosting (without Arena), you can manually instantiate a
 * Colyseus Server as documented here: 👉 https://docs.colyseus.io/server/api/#constructor-options 
 */
// import { listen } from "@colyseus/arena";

// Import arena config
import arenaConfig from "./arena.config";

// // Create and listen on 2567 (or PORT environment variable.)
// listen(arenaConfig);

import http from "http";
import express from "express";
import { Server } from "colyseus";

function setup(app: express.Application, server: http.Server) {
  const gameServer = new Server({ server });

  arenaConfig.initializeGameServer?.(gameServer);
  arenaConfig.beforeListen?.();

  // TODO: configure `app` and `gameServer` accourding to your needs.
  // gameServer.define("room", YourRoom);

  return app;
}

if (process.env.NODE_ENV === "production") {
  require('greenlock-express')
    .init({
      packageRoot: __dirname,
      configDir: "./greenlock.d",

      // contact for security and critical bug notices
      maintainerEmail: "info@quorumcontrol.com",

      // whether or not to run at cloudscale
      cluster: false
  })
    .ready(function (glx:any) {
      const app = express();

      // Serves on 80 and 443
      // Get's SSL certificates magically!
      glx.serveApp(setup(app, glx.httpsServer(undefined, app)));
    });

} else {
  // development port
  const PORT = process.env.PORT || 2567;

  const app = express();
  const server = http.createServer(app);

  setup(app, server);
  server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
}