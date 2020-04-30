import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";

/**
 * tank container
 */
export default class TestContainer extends me.Entity {

    init(x, y, w, h) {

        const settings = {
            width: w,
            height: h
        }

        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);
        // this._super(me.Container, 'init', [x, y, w, h]);

        // give a name
        this.name = "TestContainer";

        this.playername = null;


        this.setVar();
        this.setBody();
        this.setUiInteraction();

    }

    setUiInteraction() {

        // const HUD = me.game.world.getChildByName('HUD')[0];
        //
        // const joystickLeft = HUD.getChildByName('JoystickLeft')[0];
        // if (joystickLeft) {
        //     me.input.registerPointerEvent('pointerdown',  joystickLeft, this.start.bind(this));
        //     me.input.registerPointerEvent('pointermove',  joystickLeft, this.move.bind(this));
        //     me.input.registerPointerEvent('pointerleave', joystickLeft, this.stop.bind(this));
        //     me.input.registerPointerEvent('pointerup',    joystickLeft, this.stop.bind(this));
        // }


    }


    update (dt) {

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);


        return this._super(me.Container, "update", [dt]);

    }

    /**
     * collision handler
     */
    onCollision (response, other) {

        return false;

    }

    setBody() {

        this.body = new me.Body(this);
        this.body.removeShapeAt(0);
        this.body.addShape(new me.Rect(0, 0, 80, 100));
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.gravity = 0;
        this.body.setMaxVelocity(0, 0);
        this.body.setFriction(0, 0);



        this.body.getShape(0)
            .translate(80, 50)
            .rotate(45 * Math.PI / 180)
            .recalc();


        this.alwaysUpdate = true;
    }

    setVar() {

        this.prevTrackPos = {
            x: 0,
            y: 0
        };

        this.centerPointer = {
            x: 0,
            y: 0
        };

        this.speed = 0;

        this.angle = 0;
        this.prevDegrees = 0;

        this.centerGunPointer = {
            x: 0,
            y: 0
        };
        this.angleGun = 0;
        this.prevGunDegrees = 0;

        this.anchorPoint.x = 0;
        this.anchorPoint.y = 0;

        this.isGunMoved = 0;
    }

    // draw(renderer) {
    //
    //
    //     let shape = this.body.getShape(0);
    //
    //     renderer.setColor("red");
    //
    //     renderer.stroke(shape);
    //
    //
    // }


}
