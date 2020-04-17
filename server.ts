import path from 'path';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'colyseus';
//import { monitor } from '@colyseus/monitor';

// Import demo room handlers
import { GameRoom } from "./src/server/rooms/game";


const hostname = '0.0.0.0';
const port = Number(process.env.PORT || 2657) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();

app.use(cors());
app.use(express.json());

// Attach WebSocket Server on HTTP Server.
const gameServer = new Server({
  server: createServer(app),
  express: app,
  pingInterval: 0,
});


// Register ChatRoom as "chat"
gameServer.define("game", GameRoom);
// gameServer.define("chat", ChatRoom);


//app.use('/', express.static(path.join(__dirname, "../../../dist")));
//console.log(__dirname);
app.use('/', express.static(path.join(__dirname, "build")));

// (optional) attach web monitoring panel
//app.use('/colyseus', monitor());

gameServer.onShutdown(function(){
  console.log(`game server is going down.`);
});


gameServer.listen(port); //, hostname

// process.on("uncaughtException", (e) => {
//   console.log(e.stack);
//   process.exit(1);
// });

console.log(`Listening on http://${ hostname }:${ port }`);
