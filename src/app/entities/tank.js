import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";

/**
 * tank container
 */
export default class TankContainer extends me.Container {

    init(x, y, w, h) {

        // w = 83;
        // h = 78;

        // call the constructor
        this._super(me.Container, 'init', [x, y, w, h]);

        // give a name
        this.name = "TankContainer";

        this.playername = null;


        this.setVar();
        this.mount();
        this.setBody();
        this.setUiInteraction();


        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);

        //this.tint = new me.Color(128, 128, 128);

        game.mp = {...game.mp, ...{
            x: this.pos.x,
            y: this.pos.y
        }};

    }

    getPlayername() {
        return this.playername;
    }

    setPlayername(playername) {

        this.playername = playername;

        //player name
        this.addChild(me.pool.pull("PlayerNameEntity", this.width - 35, 35, this.playername), 20);

        game.mp = {...game.mp, ...{
                playername: this.playername
            }};

    }

    setUiInteraction() {

        const HUD = me.game.world.getChildByName('HUD')[0];

        const joystickLeft = HUD.getChildByName('JoystickLeft')[0];
        if (joystickLeft) {
            me.input.registerPointerEvent('pointerdown',  joystickLeft, this.start.bind(this));
            me.input.registerPointerEvent('pointermove',  joystickLeft, this.move.bind(this));
            me.input.registerPointerEvent('pointerleave', joystickLeft, this.stop.bind(this));
            me.input.registerPointerEvent('pointerup',    joystickLeft, this.stop.bind(this));
        }

        //const joystickRight = HUD.getChildByName('JoystickRight')[0];
        // if (joystickRight) {
        //     me.input.registerPointerEvent('pointerdown', joystickRight, this.startGun.bind(this, joystickRight));
        //     me.input.registerPointerEvent('pointermove', joystickRight, this.rotateGun.bind(this));
        //     me.input.registerPointerEvent('pointerleave', joystickRight, this.stopGun.bind(this));
        // }

        //me.event.subscribe("shoot", this.shoot.bind(this));

        if(me.device.isMobile) {
            const shootButton = HUD.getChildByName('ShootEntity')[0];
            const leftButton = HUD.getChildByName('LeftGunEntity')[0];
            const rightButton = HUD.getChildByName('RightGunEntity')[0];

            me.input.registerPointerEvent('pointerdown', shootButton, this.shoot.bind(this));

            me.input.registerPointerEvent('pointerdown', leftButton, this.rotateGunLeft.bind(this));
            me.input.registerPointerEvent('pointerup', leftButton, this.stopGun.bind(this));
            me.input.registerPointerEvent('pointerleave', leftButton, this.stopGun.bind(this));

            me.input.registerPointerEvent('pointerdown', rightButton, this.rotateGunRight.bind(this));
            me.input.registerPointerEvent('pointerup', rightButton, this.stopGun.bind(this));
            me.input.registerPointerEvent('pointerleave', rightButton, this.stopGun.bind(this));
        }

        // me.event.subscribe("gunleft", this.rotateGunLeft.bind(this));
        // me.event.subscribe("gunright", this.rotateGunRight.bind(this));

        // enable the keyboard
        me.input.bindKey(me.input.KEY.Z, "gunleft");
        me.input.bindKey(me.input.KEY.X, "gunright");
        me.input.bindKey(me.input.KEY.SPACE, "shoot", true);

    }

    addTracks() {

        if(this.isStarted &&
            (this.pos.y >= (this.prevTrackPos.y + 16)) || (this.pos.y < (this.prevTrackPos.y - 16)) ||
            (this.pos.x >= (this.prevTrackPos.x + 16)) || (this.pos.x < (this.prevTrackPos.x - 16))
        ) {

            const track = me.pool.pull("TracksEntity",
                this.pos.x,
                this.pos.y + 60,
                {
                    name: 'TracksEntity',
                    width: 160,
                    height: 17,
                    // frameheight: 16,
                    // framewidth: 83,
                    image: game.tank_sheet, region: 'tracks',
                    //image: 'tracks',
                    anchorPoint: {x:0,y:0},
                    angle: this.angle || 0
                }
            );

            me.game.world.addChild(track, 4);

            this.prevTrackPos = {x: this.pos.x, y: this.pos.y};

        }

    }

    /**
     * collision handler
     */
    onCollision (response, other) {

        switch (response.b.body.collisionType) {

            case me.collision.types.WORLD_SHAPE:

/*                if (other.type === "tree" || other.type === "rock" || other.type === "border") {

                    return true;
                }*/
                return true;
                break;

            case me.collision.types.ENEMY_OBJECT:

                return true;

                break;

            default:
                return false;
        }

        return false;
    }

    onDestroyEvent () {

        if ( this.getChildByName('TankEntity') ) {
            this.removeChildNow( this.getChildByName('TankEntity') );
        }

        if ( this.getChildByName('GunEntity') ) {
            this.removeChildNow( this.getChildByName('GunEntity') );
        }
    }

    setBody() {

        this.body = new me.Body(this);
        this.body.addShape(new me.Rect(40, 50, 80, 100));
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.gravity = 0;
        this.body.setMaxVelocity(0, 0);
        this.body.setFriction(0, 0);

        this.alwaysUpdate = true;
    }

    setVar() {

        this.prevPos = {
            x: 0,
            y: 0
        };

        this.maxPower = 0.075;
        this.maxReverse = 0.0375;
        this.powerFactor = 0.001;
        this.reverseFactor = 0.0005;

        this.drag = 0.95;
        this.angularDrag = 0.95;
        this.turnSpeed = 0.002;

        this.touching = {
            up: 0,
            down: 0,
            left: 0,
            right: 0
        }
        
        this.localCar = {

            x: me.game.viewport.width / 2,
            y: me.game.viewport.height / 2,
            xVelocity: 0,
            yVelocity: 0,
            power: 0,
            reverse: 0,
            angle: 0,
            angularVelocity: 0,
            isThrottling: false,
            isReversing: false

        };


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

    mount() {

        me.pool.register("TankEntity", TankEntity);
        me.pool.register("GunEntity", GunEntity);
        me.pool.register("BulletEntity", BulletEntity);
        me.pool.register("FireEntity", FireEntity);
        me.pool.register("TracksEntity", TracksEntity);
        me.pool.register("PlayerNameEntity", PlayerNameEntity);


        const tankSettings = {
            name: 'TankEntity',
            x: 0,
            y: 0,
            width: 160,
            height: 160,
            image: game.tank_sheet, region: 'tank',
            //image: 'tank',
            anchorPoint: {x:0,y:0},
        };

        const gunSettings = {
            name: 'GunEntity',
            x: 0,
            y: 0,
            width: 160,
            height: 160,
            image: game.tank_sheet, region: 'barrel',
            // image: 'barrel',
            anchorPoint: {x:0,y:0}
        };

        this.addChild(me.pool.pull("TankEntity", tankSettings.x, tankSettings.y, tankSettings), 10);
        this.addChild(me.pool.pull("GunEntity", gunSettings.x, gunSettings.y, gunSettings), 20);

        // this.width = tankSettings.width;
        // this.height = tankSettings.height;

        this.updateChildBounds();
    }

    isDead() {
        return game.mp.hit;
    }

    shoot() {

        if ( this.isDead() || me.game.world.getChildByName('BulletEntity').length > 0) {
            return;
        }


        const gun = this.getChildByName('GunEntity')[0];

        me.audio.play("shoot", false, null, 0.5);


        me.game.world.addChild(me.pool.pull("BulletEntity",
            this.pos.x + (this.width / 2) - 12,
            this.pos.y + 25,
            {
                name: 'BulletEntity',
                width: 20,
                height: 20    ,
                framewidth: 20,
                frameheight: 34,
                image: game.tank_sheet, region: 'bullet',
                //image: 'bullet',
                anchorPoint: {x:0,y:0},
                angle: this.angleGun || 0,
                shootedBy: this.body.collisionType,
                shootedByPlayername: this.getPlayername()
            }
        ), 4);

        this.addChild(me.pool.pull("FireEntity",
            0,
            0,
            {
                name: 'FireEntity',
                width: 160,
                height: 160,
                // frameheight: 64,
                // framewidth: 64,
                image: game.tank_sheet, region: 'fire',
                //image: 'fire',
                anchorPoint: {x:0,y:0},
                angle: this.angleGun || 0
            }
        ), 4);

        // send multiplayer data
        game.mp.shoot = true;
        Mp.send({...game.mp});

        setTimeout(() => {
            game.mp.shoot = false;
        }, 100);

    }

    explode() {

        me.game.viewport.shake(10, 500, me.game.viewport.AXIS.BOTH);

        this.stop(null);

        const tank = this.getChildByName('TankEntity')[0];
        const gun = this.getChildByName('GunEntity')[0];

        if (this.name == 'TankContainer') {
            me.device.vibrate(1000);
        }

        tank.renderable.flicker(500);
        gun.renderable.flicker(500);

        if (this.name == 'EnemyContainer') {
            this.pos.x = -300;
            this.pos.y = -300;
        }
    }

    respawn(x, y) {

        me.audio.play("cling");

        this.pos.x = x;
        this.pos.y = y;

        // send multiplayer data
        game.mp.respawn = false;
        game.mp.hit = false;
        Mp.send({...game.mp});

    }

    stopGun(e) {

        this.isGunMoved = 0;

    }

    rotateGunLeft() {

        this.isGunMoved = -2;

    }

    rotateGunRight() {

        this.isGunMoved = 2;

    }

    start(e) {

        if (this.isDead()) return;

        this.isStarted = true;

        me.audio.playTrack("tank", 0.5);


        this.centerPointer = {
            x: e.pos.x,
            y: e.pos.y
        };

        this.speed = 0;


    }

    stop(e) {

        this.isStarted = false;

        me.audio.stopTrack("tank");

        this.speed = 0;

    }

    move(e) {

        if (!this.isStarted) return;

        
        const diff = {
            x: e.pos.x - this.prevPos.x,
            y: e.pos.y - this.prevPos.y
        };


        this.prevPos.x = e.pos;


        this.touching.up -= diff.y / (me.game.viewport.height / 3);
        this.touching.down += diff.y / (me.game.viewport.height  / 3);
        this.touching.left -= diff.x / (me.game.viewport.width / 3);
        this.touching.right += diff.x / (me.game.viewport.width / 3);


        this.touching.up = Math.max(0, Math.min(1, this.touching.up));
        this.touching.down = Math.max(0, Math.min(1, this.touching.down));
        this.touching.left = Math.max(0, Math.min(1, this.touching.left));
        this.touching.right = Math.max(0, Math.min(1, this.touching.right));



        const canTurn = this.localCar.power > 0.0025 || this.localCar.reverse;


        const throttle = Math.round(this.touching.up * 10) / 10;
        const reverse = Math.round(this.touching.down * 10) / 10;

        if (this.localCar.isThrottling !== throttle || this.localCar.isReversing !== reverse) {
            this.localCar.isThrottling = throttle;
            this.localCar.isReversing = reverse;
        }

        const turnLeft = canTurn && Math.round(this.touching.left * 10) / 10;
        const turnRight = canTurn && Math.round(this.touching.right * 10) / 10;


        if (this.localCar.isTurningLeft !== turnLeft) {
            this.localCar.isTurningLeft = turnLeft;
        }

        if (this.localCar.isTurningRight !== turnRight) {
            this.localCar.isTurningRight = turnRight;
        }


        if (this.localCar.isThrottling) {
            this.localCar.power += this.powerFactor * this.localCar.isThrottling;
        } else {
            this.localCar.power -= this.powerFactor;
        }

        if (this.localCar.isReversing) {
            this.localCar.reverse += this.reverseFactor;
        } else {
            this.localCar.reverse -= this.reverseFactor;
        }


        this.localCar.power = Math.max(0, Math.min(this.maxPower, this.localCar.power));
        this.localCar.reverse = Math.max(0, Math.min(this.maxReverse, this.localCar.reverse));

        const direction = this.localCar.power > this.localCar.reverse ? 1 : -1;

        if (this.localCar.isTurningLeft) {
            this.localCar.angularVelocity -= direction * this.turnSpeed * this.localCar.isTurningLeft;
        }
        if (this.localCar.isTurningRight) {
            this.localCar.angularVelocity += direction * this.turnSpeed * this.localCar.isTurningRight;
        }

    }

    move_old(e) {

        if (!this.isStarted) return;

        const position = e.pos;
        const center = this.centerPointer;

        // angle in radians
        const radians = Math.atan2(position.y - center.y, position.x - center.x);

        // angle in degrees
        let degrees = Math.atan2(position.y - center.y, position.x - center.x) * 180 / Math.PI;
        degrees = Math.floor(degrees);

        degrees += 90;

        if (position.x < 0 ) {
            degrees += 180;
        } else if(position.y < 0 ) {
            degrees += 360;
        }

        const totDegrees = (degrees - this.prevDegrees);


        const tank = this.getChildByName('TankEntity')[0];
        const gun = this.getChildByName('GunEntity')[0];

        console.log(degrees, this.prevDegrees);

        //this.speed = 2;

        if (this.speed == 0) {
            this.speed = 2;
        }


        // reverse gear?
        // if (
        //     (totDegrees > 160 && totDegrees < 200) ||
        //     (totDegrees < -160 && totDegrees > -200)
        // ) {
        //
        //     console.log('retro');
        //     tank.centerRotate(180);
        //     gun.centerRotate(180);
        //
        //     this.angleGun += 180 * (Math.PI / 180);
        //
        // }


        //this.body.addShape(new me.Rect(40, 50, 80, 100));



        // this.body.getShape(0)
        //     .translate(this.width / 2, this.height / 2)
        //     .rotate(totDegrees * Math.PI / 180)
        //     .translate(-this.width / 2, -this.height / 2)
        //     .recalc();


        tank.centerRotate(totDegrees);
        gun.centerRotate(totDegrees);

        this.angle += totDegrees * (Math.PI / 180);
        this.angleGun += totDegrees * (Math.PI / 180);

        this.prevDegrees = degrees;


        game.mp = {...game.mp, ...{
                angle: this.angle,
                angleGun: this.angleGun,
                tankDegrees: degrees,
            }};


    }

    update (dt) {


        this.localCar.xVelocity += Math.sin(this.localCar.angle) * (this.localCar.power - this.localCar.reverse);
        this.localCar.yVelocity += Math.cos(this.localCar.angle) * (this.localCar.power - this.localCar.reverse);


        // move tank
        console.log(this.pos.x, this.pos.y);
        this.pos.x += this.localCar.xVelocity;
        this.pos.y -= this.localCar.yVelocity;


        this.localCar.x += this.localCar.xVelocity;
        this.localCar.y -= this.localCar.yVelocity;


        this.localCar.xVelocity *= this.drag;
        this.localCar.yVelocity *= this.drag;


        this.localCar.angle += this.localCar.angularVelocity;
        this.localCar.angularVelocity *= this.angularDrag;



        return this._super(me.Container, "update", [dt]);


    }

    update_old (dt) {

        if (me.audio.seek("tank") >= 2.38) {
            me.audio.seek("tank", 1.2);
        }

        if (me.audio.seek("gun_battle_sound-ReamProductions") >= 20) {
            me.audio.seek("gun_battle_sound-ReamProductions", 0);
        }

        if (me.input.isKeyPressed('shoot')) {
            this.shoot();
        }

        // gun keyboard movement
        let moveAngle = 0;

        if (this.isGunMoved !== 0) {
            moveAngle = this.isGunMoved;
        }

        if (me.input.isKeyPressed('gunleft')) {
            moveAngle = -2;
        }
        else if (me.input.isKeyPressed('gunright')) {
            moveAngle = 2;
        }
        if (moveAngle !== 0) {

            const deg = moveAngle;
            this.angleGun += deg * Math.PI / 180;

            this.getChildByName('GunEntity')[0].centerRotate(deg);

            game.mp.angleGun = this.angleGun;
            game.mp.gunDegrees += deg;
        }


        // move tank
        this.pos.x += (this.speed * Math.sin(this.angle));
        this.pos.y -= (this.speed * Math.cos(this.angle));



        // add tracks
        this.addTracks();


        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        this.updateChildBounds();

        // handle collisions against other shapes
        me.collision.check(this);

        // send multiplayer data
        game.mp = {...game.mp, ...{
                x: this.pos.x,
                y: this.pos.y,
            }};
        Mp.send({...game.mp});


        return this._super(me.Container, "update", [dt]);

    }


/*    postDraw(renderer) {


        let shape = this.body.getShape(0);

        renderer.setColor("red");

        renderer.stroke(shape);


    }*/


}

/**
 * a tank entity
 */
class TankEntity extends me.Entity {
    /**
     * constructor
     */
    init (x, y, settings) {

        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        //this.angle = 0;

        this.body.removeShapeAt(0);

    }

    centerRotate (deg) {

        this.renderable.currentTransform
            .translate(this.renderable.width / 2, this.renderable.height - 50)
            .rotate(deg * Math.PI / 180)
            .translate(-this.renderable.width / 2, -(this.renderable.height - 50));


    }

}

/**
 * a gun entity
 */
class GunEntity extends me.Entity {
    /**
     * constructor
     */
    init (x, y, settings) {

        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.removeShapeAt(0);

        //this.angle = 0;


    }

    centerRotate (deg) {

        this.renderable.currentTransform
            .translate(this.renderable.width / 2, this.renderable.height - 50)
            .rotate(deg * Math.PI / 180)
            .translate(-this.renderable.width / 2, -(this.renderable.height - 50));

    }

}

class TracksEntity extends me.Entity {
    /**
     * constructor
     */
    init (x, y, settings) {

        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.removeShapeAt(0);
        this.body.collisionType = me.collision.types.NO_OBJECT;
        this.renderable.currentTransform
            .translate((this.renderable.width) / 2, (this.renderable.height + 77) / 2  )
            .rotate(settings.angle)
            .translate(-(this.renderable.width) / 2, -(this.renderable.height - 77) / 2 );


        // remove after 1 sec
        let interval = me.timer.setInterval(() => {

            if (this && this.renderable) {

                const opacity = this.renderable.getOpacity();

                if (opacity <= 0) {
                    if (this.ancestor) {
                        this.ancestor.removeChild(this);
                        me.timer.clearInterval(interval);
                    }
                } else {
                    this.renderable.setOpacity( opacity - 0.1);
                }

            }
        }, 500);

    }

}

class FireEntity extends me.Entity {
    /**
     * constructor
     */
    init (x, y, settings) {

        // call the constructor
        this._super(me.Entity, 'init', [x, y, settings]);

        this.body.removeShapeAt(0);

        this.renderable.currentTransform
            .translate((this.renderable.width) / 2, (this.renderable.height  - 50) )
            .rotate(settings.angle)
            .translate(-(this.renderable.width) / 2, -(this.renderable.height - 50) );


        me.timer.setTimeout(() => {
            if(this.ancestor) {
                this.ancestor.removeChild(this);
            }
        }, 100);

    }


}

/**
 * a bullet entity
 */
class BulletEntity extends me.Entity {

    init (x, y, settings) {


        this._super(me.Entity, "init", [x, y, settings]);

        this.settings = settings;

        this.startPos = {x: x, y: y};

        this.body.gravity = 0;
        this.body.setVelocity(100, 100);
        this.body.setMaxVelocity(600, 600);
        this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;


        //this.body.getShape(0).pos.x = -12;
        this.body.getShape(0).pos.y = 84;

        this.renderable.currentTransform
            .translate((this.renderable.width) / 2, (this.renderable.height + 57) )
            .rotate(this.settings.angle)
            .translate((-this.renderable.width + -6) / 2, -(this.renderable.height + 77));

        this.alwaysUpdate = true;
    }

    update (time) {

        this.body.vel.x += this.body.accel.x * time / 1000 * (Math.sin(this.settings.angle));
        this.body.vel.y -= this.body.accel.y * time / 1000 * (Math.cos(this.settings.angle));

        this.body.update();

        me.collision.check(this);

        if (
            this.pos.x > (this.startPos.x + this.body.maxVel.x) ||
            this.pos.y > (this.startPos.y + this.body.maxVel.y) ||
            this.pos.x < (this.startPos.x - this.body.maxVel.x) ||
            this.pos.y < (this.startPos.y - this.body.maxVel.y)
        ) {
            //console.log('remove bullet');
            if(this.ancestor) {
                this.ancestor.removeChild(this);
            }
        }

        return this._super(me.Entity, "update", [time]);
    }

    onCollision (response, other) {

        // console.log(response.b.body.collisionType, other);
        if (response.b.body.collisionType === me.collision.types.WORLD_SHAPE) {

            if(this.ancestor) {
                this.ancestor.removeChild(this);
            }

            return true;

        }

        if (this.settings.shootedBy === me.collision.types.PLAYER_OBJECT && response.b.body.collisionType === me.collision.types.ENEMY_OBJECT) {

            console.log('colpito il nemico');

            game.data.score += 10;

            if(this.ancestor) {
                this.ancestor.removeChild(this);
            }

            other.explode();


            return true;

        }

        if (this.settings.shootedBy === me.collision.types.ENEMY_OBJECT && response.b.body.collisionType === me.collision.types.PLAYER_OBJECT) {

            console.log('colpito dal nemico');

            if(this.ancestor) {
                this.ancestor.removeChild(this);
            }

            other.explode();


            // send multiplayer data
            game.mp.hit = true;
            game.mp.hitBy = this.settings.shootedByPlayername;
            Mp.send({...game.mp});

            return true;

        }


        return false;
    }

}

class PlayerNameEntity extends me.Renderable {
    /**
     * constructor
     */
    init(x, y, playername) {
        // call the parent constructor
        // (size does not matter here)
        this._super(me.Renderable, 'init', [x, y, 0, 0]);

        this.name = 'PlayerNameEntity';
        this.playername = playername;



        // create the font object
        this.font = new me.BitmapText(x, y, {font:"PressStart2P", text:"------"});

        // font alignment to right, bottom
        this.font.textAlign = "left";
        this.font.textBaseline = "top";
        this.font.alpha = 0.5;

    }

    /**
     * update function
     */
    update(dt) {

        return true;
    }

    draw(renderer) {
        // this.pos.x, this.pos.y are the relative position from the screen right bottom
        this.font.draw(renderer, this.playername, this.pos.x, this.pos.y);
        this.font.resize(0.75);
    }
}
