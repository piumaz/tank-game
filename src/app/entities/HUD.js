import {me} from 'melonjs';
import game from './../game';

/**
 * a HUD container and child items
 */

export default class HUD extends me.Container {

    init(x, y) {
        // call the constructor
        this._super(me.Container, 'init', [x, y, me.game.viewport.width, me.game.viewport.height]);

        // persistent across level change
        this.isPersistent = true;

        // make sure we use screen coordinates
        this.floating = true;

        // give a name
        this.name = "HUD";

        // this.width = me.game.viewport.width;
        // this.height = me.game.viewport.height;

        this.anchorPoint.x = 0;
        this.anchorPoint.y = 0;

        // add our child score object at the top left corner
        //this.addChild(new ScoreItem(0, 10));




        if(me.device.isMobile) {
            const leftSettings = {
                name: 'JoystickLeft',
                // x: -90,
                // y: me.game.viewport.height - 270,
                // width: 360,
                // height: 360,
                x: 0,
                y: 0,
                width: this.width / 2,
                height: this.height,
                hasSprite: false,
            };

            // const rightSettings = {
            //     name: 'JoystickRight',
            //     x: me.game.viewport.width - 170,
            //     y: me.game.viewport.height - 170,
            //     width: 160,
            //     height: 160,
            //     hasSprite: true
            // };

            const JoystickLeft = new JoystickContainer(leftSettings.x, leftSettings.y, leftSettings);
            //const JoystickRight = new JoystickContainer(rightSettings.x, rightSettings.y, rightSettings);

            this.JoystickLeft = this.addChild(JoystickLeft, 2);
            //this.addChild(JoystickRight, 1);


            me.pool.register("UiBtnEntity", UiBtnEntity);

            const shootSettings = {
                name: 'ShootEntity',
                x: 0,
                y: 0,
                width: 80,
                height: 80,

                image: 'shoot',
                publishEvent: 'shoot'
            };

            // me.pool.register("ShootEntity", UiBtnEntity);
            this.ShootEntity = this.addChild(me.pool.pull("UiBtnEntity", shootSettings.x, shootSettings.y, shootSettings), 3);


            const rightGunSettings = {
                name: 'RightGunEntity',
                x: 0,
                y: 0,
                width: 80,
                height: 80,

                image: 'leftgun',
                publishEvent: 'gunright',
                flipX: true
            };

            const leftGunSettings = {
                name: 'LeftGunEntity',
                x: 0,
                y: 0,
                width: 80,
                height: 80,

                image: 'leftgun',
                publishEvent: 'gunleft',
                flipX: false
            };

            this.RightGunEntity = this.addChild(me.pool.pull("UiBtnEntity", leftGunSettings.x, leftGunSettings.y, leftGunSettings), 3);
            this.LeftGunEntity = this.addChild(me.pool.pull("UiBtnEntity", rightGunSettings.x, rightGunSettings.y, rightGunSettings), 3);


        } else {
            // desktop
            const leftSettings = {
                name: 'JoystickLeft',
                x: 0,
                y: 0,
                width: this.width,
                height: this.height,
            };

            const JoystickLeft = new JoystickContainer(leftSettings.x, leftSettings.y, leftSettings);

            this.JoystickLeft = this.addChild(JoystickLeft, 2);
        }


        this.repositionChild();



    }

    repositionChild() {

        if(me.device.isMobile) {

            this.JoystickLeft.width = this.width / 2;
            this.JoystickLeft.height = this.height;

            this.ShootEntity.pos.x = this.width - 200;
            this.ShootEntity.pos.y = this.height - 90;

            this.RightGunEntity.pos.x = this.width - 90;
            this.RightGunEntity.pos.y = this.height - 90;

            this.LeftGunEntity.pos.x = this.width - 310;
            this.LeftGunEntity.pos.y = this.height - 90;

        } else {
            this.JoystickLeft.width = this.width / 2;
            this.JoystickLeft.height = this.height;
        }

        this.updateChildBounds();

    }
}

class JoystickContainer extends me.Container {

    init(x, y, settings) {
        // call the constructor
        this._super(me.Container, 'init', [x, y, settings.width, settings.height]);

        // persistent across level change
        // this.isPersistent = true;

        // make sure we use screen coordinates
        this.floating = true;

        // give a name
        this.name = settings.name;

        //this.width = settings.width;
        //this.height = settings.height;

        this.anchorPoint.x = 0;
        this.anchorPoint.y = 0;

        if (settings.hasSprite) {
            const topSettings = {
                name: 'UiTopSprite',
                x: (settings.width / 2) - 48,
                y: (settings.height / 2) - 50,
                width: 96,
                height: 100,
                frameheight: 100,
                framewidth: 96,
                image: 'top',
                anchorPoint: {x:0,y:0}
            };

            const bottomSettings = {
                name: 'UiBottomSprite',
                x: (settings.width / 2) - 80,
                y: (settings.height / 2) - 80,
                width: 160,
                height: 160,
                frameheight: 160,
                framewidth: 160,
                image: 'bottom',
                anchorPoint: {x:0,y:0}
            };


            this.addChild(new UiTopSprite(topSettings.x, topSettings.y, topSettings), 2);
            this.addChild(new UiBottomSprite(bottomSettings.x, bottomSettings.y, bottomSettings), 1);

            this.updateChildBounds();
        }

    }
}

class UiTopSprite extends me.Sprite {
    /**
     * constructor
     */
    init(x, y, settings) {

        // call the constructor
        this._super(me.Sprite, 'init', [x, y, settings]);

        //this.body.collisionType = me.collision.types.;
        this.setOpacity(0.9);
    }

}

class UiBottomSprite extends me.Sprite {
    /**
     * constructor
     */
    init(x, y, settings) {

        // call the constructor
        this._super(me.Sprite, 'init', [x, y, settings]);

        this.setOpacity(0.7);


    }

}

class UiBtnEntity extends me.GUI_Object {
    /**
     * constructor
     */
    init(x, y, settings) {

        // call the constructor
        this._super(me.GUI_Object, 'init', [x, y, settings]);

        this.settings = settings;
    }

    // output something in the console
    // when the object is clicked
    // onClick(event) {
    //     me.event.publish(this.settings.publishEvent);
    //     // don't propagate the event
    //     return false;
    // }
}


/**
 * a basic HUD item to display score
 */
class ScoreItem extends me.Renderable {
    /**
     * constructor
     */
    init(x, y) {
        // call the parent constructor
        // (size does not matter here)
        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        // create the font object
        this.font = new me.BitmapFont(me.loader.getBinary('PressStart2P'), me.loader.getImage('PressStart2P'));

        // font alignment to right, bottom
        this.font.textAlign = "right";
        this.font.textBaseline = "top";

        // local copy of the global score
        this.score = -1;
    }

    /**
     * update function
     */
    update(dt) {
        // we don't draw anything fancy here, so just
        // return true if the score has been updated
        if (this.score !== game.data.score) {
            this.score = game.data.score;
            return true;
        }
        return false;
    }

    /**
     * draw the score
     */
    draw(renderer) {
        // this.pos.x, this.pos.y are the relative position from the screen right bottom
        this.font.draw (renderer, game.data.score, me.game.viewport.width + this.pos.x, this.pos.y);
    }
}

