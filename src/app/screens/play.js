import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";
import MessagesContainer from "../entities/messages";
import HUD from "../entities/HUD";
import TankContainer from "../entities/tank";
import EnemyContainer from "../entities/enemy";
import CoinEntity from "../entities/entities";

import TestContainer from "../entities/test";

export default class PlayScreen extends me.Stage {
    /**
     * action to perform on state change
     */
    onResetEvent() {

        const players = {};

        me.pool.register("HUD", HUD);
        me.pool.register("MessagesContainer", MessagesContainer);

        me.pool.register("TankContainer", TankContainer);
        me.pool.register("EnemyContainer", EnemyContainer);


        me.pool.register("CoinEntity", CoinEntity);


        // load a level
        me.levelDirector.loadLevel("area01");

        // play the audio track
        me.audio.playTrack("gun_battle_sound-ReamProductions", 0.1);

        // reset the score
        game.data.score = 0;


        this.HUD = me.game.world.addChild(me.pool.pull("HUD", 0, 0));
        this.MessagesContainer = me.game.world.addChild(me.pool.pull("MessagesContainer"));

        // join server
        Mp.join({
            width:  me.game.world.width,
            height: me.game.world.height
        }).then(() => {

            Mp.onPlayerAdd((player, sessionId) => {

                // console.log('player add', player.x , player.y);
                if (Mp.sessionId() === sessionId) {
                    //me.game.world.addChild( new TestContainer(player.x, player.y, 160, 160), 5);

                    players[sessionId] = me.game.world.addChild(me.pool.pull("TankContainer", player.x, player.y, 160, 160), 5);
                } else {
                    players[sessionId] = me.game.world.addChild(me.pool.pull("EnemyContainer", player.x, player.y, 83, 78), 5);
                }

            });

            Mp.onPlayerRemove((player, sessionId) => {
                //console.log("player left!", sessionId);
                this.MessagesContainer.addMessage(player.playername + ' left the game');
                me.game.world.removeChild( players[sessionId] );
                delete players[sessionId];

            });

            Mp.onPlayerChange((player, sessionId) => {
                //console.log("player change!", player);

                if (player.respawn) {
                    this.MessagesContainer.addMessage(player.playername + ' was killed by ' + player.hitBy);
                }

                if (player.playername && !players[sessionId].getPlayername()) {
                    players[sessionId].setPlayername(player.playername);
                    this.MessagesContainer.addMessage(player.playername + ' join the game');
                }

                if (Mp.sessionId() === sessionId) {
                    // console.log("sono io");
                    if (player.respawn) {
                        players[sessionId].respawn(player.x, player.y);
                    }

                } else {

                    players[sessionId].setData(player);

                }


            });

        });


        me.event.subscribe(me.event.VIEWPORT_ONRESIZE, (e) => {

            //console.log('change rotation', me.game.viewport.width, me.game.viewport.height);

            if (this.HUD) {
                this.HUD.width = me.game.viewport.width;
                this.HUD.height = me.game.viewport.height;

                this.HUD.repositionChild();
            }


        });
    }

    /**
     * action to perform when leaving this screen (state change)
     */
    onDestroyEvent() {

        me.game.world.removeChildNow( this.HUD );
        me.game.world.removeChildNow( me.game.world.getChildByName('TankEntity') );
        me.game.world.removeChildNow( me.game.world.getChildByName('EnemyEntity') );

        // stop the current audio track
        me.audio.stopTrack();
    }
}
