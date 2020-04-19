import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("string")
    playername = null;

    @type("number")
    x = 0;

    @type("number")
    y = 0;

    @type("number")
    angle = 0;

    @type("number")
    angleGun = 0;

    @type("number")
    tankDegrees = 0;

    @type("number")
    gunDegrees = 0;

    @type("boolean")
    shoot = false;

    @type("boolean")
    hit = false;

    @type("number")
    score = 0;

}

export class State extends Schema {

    @type({ map: Player })
    players = new MapSchema<Player>();

    something = "This attribute won't be sent to the client-side";

    createPlayer (id: string, x, y) {

        let player = new Player();

        player.x = x;
        player.y = y;
        player.playername = id;

        this.players[ id ] = player;

    }

    removePlayer (id: string) {
        delete this.players[ id ];
    }

    movePlayer (id: string, data: any) {

        // console.log('move', this.players[ id ], data);

        for (let i in data) {
            this.players[ id ][ i ] = data[i];
        }

    }
}

export class GameRoom extends Room<State> {
    maxClients = 12;
    options = null;

    onCreate (options) {
        console.log("GameRoom created!", options);

        this.options = options;

        this.setState(new State());
    }

    onAuth(client, options, req) {
        // console.log(req.headers.cookie);
        return true;
    }

    onJoin (client: Client) {

        let player_x, player_y;

        // Math.random() * (max - min) + min;
        player_x =  Math.random() * (this.options.width - 300) + 300;
        player_y = Math.random() * (this.options.height - 300) + 300;

        this.state.createPlayer(client.sessionId, player_x, player_y);

    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client, data) {

        if (typeof data === 'object') {
            this.state.movePlayer(client.sessionId, data);
        }

    }

    onDispose () {
        console.log("Dispose GameRoom");
    }

}
