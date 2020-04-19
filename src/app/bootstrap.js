import 'core-js';
import screenfull from 'screenfull';
import {me} from 'melonjs';

import resources from './resources';
import game from './game';
import TitleScreen from './screens/title';
import PlayScreen from './screens/play';


class Bootstrap {

    constructor() {


        // Initialize the video.
        if (!me.video.init(1024, 768, {wrapper : "screen", scale : "auto", scaleMethod : "fill-min"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        if (me.debug) {
            me.debug.renderHitBox = true;
        }

/*        try {
            if (screenfull.isEnabled) {
                screenfull.request();
            }
        } catch(er) {
            console.log(er);
        }*/

        // Initialize the audio.
        me.audio.init("mp3,ogg");

        // set all ressources to be loaded
        me.loader.preload(resources, this.loaded.bind(this));



    }

    loaded() {

        // load the texture atlas file
        game.tank_sheet = new me.video.renderer.Texture(
            me.loader.getJSON("tank_sheet"),
            me.loader.getImage("tank_sheet")
        );


        // set the title screen Object
        me.state.set(me.state.MENU, new TitleScreen());

        // set the "Play/Ingame" Screen Object
        me.state.set(me.state.PLAY, new PlayScreen());

        // set a global fading transition for the screen
        me.state.transition("fade", "#000000", 250);

        // display the menu title
        me.state.change(me.state.MENU);

    }

    static boot() {
        var bootstrap = new Bootstrap();

        // Mobile browser hacks
        if (me.device.isMobile && !navigator.isCocoonJS) {

            // // Prevent the webview from moving on a swipe
            // window.document.addEventListener("touchmove", function (e) {
            //     e.preventDefault();
            //     window.scroll(0, 0);
            //     return false;
            // }, false);
            //
            // // Scroll away mobile GUI
            // window.addEventListener("load",function() {
            //     setTimeout(function(){
            //         // This hides the address bar:
            //         window.scrollTo(0, 1);
            //         me.video.onresize(null);
            //     }, 0);
            // });

            // (function () {
            //     window.scrollTo(0, 1);
            //     me.video.onresize(null);
            // }).defer();

            // me.event.subscribe(me.event.WINDOW_ONRESIZE, function (e) {
            //     window.scrollTo(0, 1);
            // });
        }

        return bootstrap;
    }
}

me.device.onReady(function onReady() {
    Bootstrap.boot();
});
