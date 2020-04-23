import {me} from 'melonjs';
import game from "../game";

/**
 * tank container
 */
export default class MessagesContainer extends me.Container {

    init() {

        // call the constructor
        this._super(me.Container, 'init', [0, 0, me.game.viewport.width, me.game.viewport.height]);

        // give a name
        this.name = "MessagesContainer";

        // make sure we use screen coordinates
        this.floating = true;

        this.anchorPoint.x = 0;
        this.anchorPoint.y = 0;



        this.messages = [];

    }
    /**
     * draw the square
     */
    // draw(renderer) {
    //
    //     renderer.setGlobalAlpha(0.5);
    //     renderer.setColor( new me.Color(0, 0, 0) );
    //     renderer.fillRect(0, 0, this.width, 20);
    //
    // }


    addMessage(message) {

        const msg = this.addChild(new MessageEntity(20, 20 + (this.messages.length * 30), message));
        this.messages.push(msg);

        // remove after 1 sec
        const timeout = me.timer.setTimeout(() => {

            const interval = me.timer.setInterval(() => {

                if ( msg && this.hasChild(msg) ) {

                    const opacity = msg.getOpacity();

                    if (opacity <= 0) {

                        me.timer.clearInterval(interval);
                        me.timer.clearTimeout(timeout);

                        this.removeChild(msg);
                        this.messages.shift();

                        for(const child of this.getChildByType(MessageEntity)) {
                            child.pos.y = child.pos.y - 30;
                        }

                    } else {
                        msg.setOpacity( opacity - 0.2);
                    }

                }
            }, 500);

        }, 1000);



        //this.updateChildBounds();

    }

}

class MessageEntity extends me.Renderable {
    /**
     * constructor
     */
    init(x, y, message) {

        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        this.name = 'MessageEntity';
        this.message = message;

        // create the font object
        this.font = new me.BitmapText(x, y, {font:"PressStart2P", text: message});

        // font alignment to right, bottom
        this.font.textAlign = "left";
        this.font.textBaseline = "top";
        this.font.alpha = 0.5;

        this.tint = new me.Color(0, 0, 0);

    }

    draw(renderer) {
        // this.pos.x, this.pos.y are the relative position from the screen right bottom
        this.font.draw(renderer, this.message, this.pos.x, this.pos.y);

        if(me.device.isMobile) {
            this.font.resize(1.25);
        } else {
            this.font.resize(0.75);
        }

    }
}
