import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";
import TextInput from "../entities/textinput";

export default class TitleScreen extends me.Stage {
    /**
     * action to perform on state change
     */
    onResetEvent() {

        // title screen
        var backgroundImage = new me.Sprite(0, 0, {
                image: me.loader.getImage('title_screen'),
            }
        );

        // position and scale to fit with the viewport size
        backgroundImage.anchorPoint.set(0, 0);
        backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);

        // add to the world container
        me.game.world.addChild(backgroundImage, 1);


        me.game.world.addChild( new TextInput((me.game.viewport.width / 2), (me.game.viewport.height / 2), {
            type: 'text',
            id: 'playername',
            placeholder: 'Insert your name...',
            maxlength: 20,
            pattern: '[a-zA-Z0-9_\-]+'
        }));



        // button enter
        me.game.world.addChild(new UiButtonEnter((me.game.viewport.width / 2) , me.game.viewport.height / 2 , {
            name: 'UiButtonEnter',
            width: 108,
            height: 48,
            image: 'start',
        }));


        this.subResize = (e) => {
            console.log('change rotation title');
            this.onDestroyEvent();
            this.reset();

        }

        me.event.subscribe(me.event.WINDOW_ONRESIZE, this.subResize);

    }

    /**
     * action to perform when leaving this screen (state change)
     */
    onDestroyEvent() {
        console.log('destroy');
        me.event.unsubscribe(me.event.WINDOW_ONRESIZE, this.subResize);

        //me.input.unbindKey(me.input.KEY.ENTER);
        //me.input.unbindPointer(me.input.pointer.LEFT);

    }
}

class UiButtonEnter extends me.GUI_Object {
    /**
     * constructor
     */
    init(x, y, settings) {

        // call the constructor
        this._super(me.GUI_Object, 'init', [x, y, settings]);

    }

    // output something in the console
    // when the object is clicked
    onClick(event) {

        game.mp.playername = document.getElementById('playername').value || 'anonymous';
        me.audio.play("cling");
        me.state.change(me.state.PLAY);

        // don't propagate the event
        return false;
    }
}
