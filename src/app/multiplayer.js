import * as Colyseus from 'colyseus.js';

class Mp {

    constructor() {

        //const host = '192.168.0.6';
        // const host = '0.0.0.0';
        // const host = 'localhost';
        // const port = 2657;
        // this.client = new Colyseus.Client(`ws://${host}:${port}`);
        //
        var HOST = location.origin.replace(/^http/, 'ws');

        this.client = new Colyseus.Client(HOST);


        this.room = null;
    }

    join(options) {

        return new Promise((resolve, reject) => {

            this.client.joinOrCreate("game", options).then(room => {

                console.log(room.sessionId, room, "joined", room.name);

                this.room = room;

                this.room.onError(() => {
                    console.log(this.client.id, "couldn't join", room.name);
                });

                // this.room.state.players.onAdd = function(player, i) {
                //     console.log("player joined!", player);
                // }
                //
                // this.room.state.players.onRemove = function(player, i) {
                //     console.log("player left!", player);
                // }
                //
                // this.room.state.players.onChange = function(player, i) {
                //     console.log("player has been updated!", player);
                // }
                //
                // this.room.onStateChange((state) => {
                //     console.log(`${ this.room.sessionId } has a new state:`, state);
                // });

                resolve();

            }).catch(e => {
                console.log("JOIN ERROR", e);
                reject(e);
            });


        });


    }

    sessionId() {
        return this.room.sessionId;
    }

    send(msg) {

        //console.log('msg', msg);
        this.room.send(msg);

    }

    onMessage(fn) {

        this.room.onMessage(fn);

    }

    onChange(fn) {

        this.room.onStateChange(fn);

    }

    onPlayerAdd(fn) {

        this.room.state.players.onAdd = fn;

    }

    onPlayerRemove(fn) {

        this.room.state.players.onRemove = fn

    }

    onPlayerChange(fn) {

        this.room.state.players.onChange = fn

    }


}

export default new Mp();
