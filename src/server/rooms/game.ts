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

    @type("boolean")
    respawn = false;

    @type("number")
    score = 0;

}

export class State extends Schema {

    @type({ map: Player })
    players = new MapSchema<Player>();


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

        for (let i in data) {
            this.players[ id ][ i ] = data[i];
        }

    }
}

export class GameRoom extends Room<State> {

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

    getRespawnPosition() {
        return {
            x: Math.random() * ((this.options.width - 300) - 300) + 300,
            y: Math.random() * ((this.options.height - 300) - 300) + 300
        }
    }

    onJoin (client: Client) {

        const pos = this.getRespawnPosition();
        this.state.createPlayer(client.sessionId, pos.x, pos.y);

    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client, data) {

        if (typeof data === 'object') {

            if(data.hit) {
                //respawn
                const pos = this.getRespawnPosition();
                data.x = pos.x;
                data.y = pos.y;
                data.hit = false;
                data.respawn = true;
            }

            this.state.movePlayer(client.sessionId, data);
        }

    }

    onDispose () {
        console.log("Dispose GameRoom");
    }

}
