import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";
import HUD from "../entities/HUD";
import TankContainer from "../entities/tank";
import EnemyContainer from "../entities/enemy";
import CoinEntity from "../entities/entities";

export default class PlayScreen extends me.Stage {
    /**
     * action to perform on state change
     */
    onResetEvent() {

        const players = {};

        me.pool.register("HUD", HUD);
        me.pool.register("TankContainer", TankContainer);
        me.pool.register("EnemyContainer", EnemyContainer);

        me.pool.register("CoinEntity", CoinEntity);


        // load a level
        me.levelDirector.loadLevel("area01");

        // play the audio track
        //me.audio.playTrack("gun_battle_sound-ReamProductions", 0.1);

        // reset the score
        game.data.score = 0;


        me.game.world.addChild(me.pool.pull("HUD", 0, 0));


        // join server
        Mp.join({
            width:  me.game.world.width,
            height: me.game.world.height
        }).then(() => {

            Mp.onPlayerAdd((player, sessionId) => {

                //console.log(player.x , player.y);

                if (Mp.sessionId() === sessionId) {
                    players[sessionId] = me.game.world.addChild(me.pool.pull("TankContainer", player.x, player.y, game.mp.playername, 83, 78), 5);

                } else {
                    players[sessionId] = me.game.world.addChild(me.pool.pull("EnemyContainer", player.x, player.y, player.playername, 83, 78), 5);
                }

            });

            Mp.onPlayerRemove((player, sessionId) => {
                console.log("player left!", sessionId);
                me.game.world.removeChild( players[sessionId] );
                delete players[sessionId];

            });

            Mp.onPlayerChange((player, sessionId) => {
                // console.log("player change!", player);

                if (Mp.sessionId() === sessionId) {
                    // console.log("sono io, nulla");
                    return;
                }


                players[sessionId].setData(player);

            });

        });


        me.event.subscribe(me.event.WINDOW_ONORIENTATION_CHANGE, (e) => {
            console.log('change rotation', me.game.viewport.width, me.game.viewport.height);

            me.game.world.getChildByName('HUD')[0].width = me.game.viewport.width;
            me.game.world.getChildByName('HUD')[0].height = me.game.viewport.height;


            me.game.world.getChildByName('HUD')[0].repositionChild();

        });
    }

    /**
     * action to perform when leaving this screen (state change)
     */
    onDestroyEvent() {

        me.game.world.removeChildNow( me.game.world.getChildByName('HUD') );
        me.game.world.removeChildNow( me.game.world.getChildByName('TankEntity') );
        me.game.world.removeChildNow( me.game.world.getChildByName('EnemyEntity') );

        // stop the current audio track
        me.audio.stopTrack();
    }
}
