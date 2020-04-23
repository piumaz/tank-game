import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";
import TextInput from "../entities/textinput";

export default class TitleScreen extends me.Stage {
    /**
     * action to perform on state change
     */
    onResetEvent() {

        // play the audio track
        me.audio.play("Metallica_Seek_and_Destroy_Lyrics", 0, null, 1);
        me.audio.fade("Metallica_Seek_and_Destroy_Lyrics", 1, 0, 10000);


        // title screen
        var backgroundImage = new me.Sprite(0, 0, {
                image: me.loader.getImage('title_screen3'),
            }
        );

        // position and scale to fit with the viewport size
        backgroundImage.anchorPoint.set(0, 0);
        backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);
        //backgroundImage.pos.set(me.game.viewport.width / 2, me.game.viewport.height / 2, 1);

        // add to the world container
        me.game.world.addChild(backgroundImage, 1);


        const titlescreen = document.getElementById('titlescreen');
        titlescreen.style.display = 'block';

        const btn = document.getElementById('btn-play');
        btn.onclick = (e) => {
            game.mp.playername = document.getElementById('playername').value || 'anonymous';

            me.audio.stop("Metallica_Seek_and_Destroy_Lyrics");
            me.audio.play("cling");
            me.state.change(me.state.PLAY);

            titlescreen.style.display = 'none';
        }

        this.subResize = (e) => {
            console.log('change rotation title');
            this.onDestroyEvent();
            this.reset();

        }

        me.event.subscribe(me.event.WINDOW_ONORIENTATION_CHANGE, this.subResize);

    }

    /**
     * action to perform when leaving this screen (state change)
     */
    onDestroyEvent() {
        me.event.unsubscribe(me.event.WINDOW_ONORIENTATION_CHANGE, this.subResize);


        //me.input.unbindKey(me.input.KEY.ENTER);
        //me.input.unbindPointer(me.input.pointer.LEFT);

    }
}
