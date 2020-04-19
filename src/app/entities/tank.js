import {me} from 'melonjs';
import game from './../game';
import Mp from "../multiplayer";

/**
 * tank container
 */
export default class TankContainer extends me.Container {

    init(x, y, playername, w, h) {

        // w = 83;
        // h = 78;

        // call the constructor
        this._super(me.Container, 'init', [x, y, w, h]);

        // give a name
        this.name = "TankContainer";

        this.playername = playername;


        this.setVar();
        this.mount();
        this.setBody();
        this.setUiInteraction();


        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);

        //player name
        this.addChild(me.pool.pull("PlayerNameEntity", this.width, -10, this.playername), 20);

        //this.tint = new me.Color(128, 128, 128);

        game.mp = {...game.mp, ...{
            x: this.pos.x,
            y: this.pos.y,
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
                this.pos.y + this.height,
                {
                    name: 'TracksEntity',
                    width: 83,
                    height: 16,
                    // frameheight: 16,
                    // framewidth: 83,
                    image: game.tank_sheet, region: 'tracks',
                    anchorPoint: {x:0,y:0},
                    angle: this.angle || 0
                }
            );

            me.game.world.addChild(track, 4);

            this.prevTrackPos = {x: this.pos.x, y: this.pos.y};

        }

    }

    update (dt) {

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
        this.pos.x += (this.speedx * Math.sin(this.angle));
        this.pos.y -= (this.speedy * Math.cos(this.angle));


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
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.gravity = 0;
        this.body.setMaxVelocity(0, 0);
        this.body.setFriction(0, 0);

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
        this.speedx = 0;
        this.speedy = 0;
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
            x: 0.5,
            y: 0.5,
            width: 83,
            height: 78,
            image: game.tank_sheet, region: this.name == 'TankContainer' ? 'tankRed_outline' : 'tankBlack_outline',
            anchorPoint: {x:0,y:0},
        };

        const gunSettings = {
            name: 'GunEntity',
            x: (83 - 24) / 2,
            y: -10,
            width: 24,
            height: 58,
            image: game.tank_sheet, region: this.name == 'TankContainer' ? 'barrelRed_outline' : 'barrelBlack_outline',
            anchorPoint: {x:0,y:0}
        };

        this.addChild(me.pool.pull("TankEntity", tankSettings.x, tankSettings.y, tankSettings), 10);
        this.addChild(me.pool.pull("GunEntity", gunSettings.x, gunSettings.y, gunSettings), 20);

        // this.width = tankSettings.width;
        // this.height = tankSettings.height;

        this.updateChildBounds();
    }

    shoot() {

        if ( me.game.world.getChildByName('BulletEntity').length > 0) {
            return;
        }


        const gun = this.getChildByName('GunEntity')[0];

        me.audio.play("shoot", false, null, 0.5);


        this.addChild(me.pool.pull("FireEntity",
            (this.width / 2) - 32,
            -60,
            {
                name: 'FireEntity',
                width: 64,
                height: 64,
                // frameheight: 64,
                // framewidth: 64,
                image: game.tank_sheet, region: 'fire',
                anchorPoint: {x:0,y:0},
                angle: this.angleGun || 0
            }
        ), 15);


        me.game.world.addChild(me.pool.pull("BulletEntity",
            this.pos.x + (this.width / 2) - 10,
            this.pos.y + (this.height / 2) - 34,
            {
                name: 'BulletEntity',
                width: 20,
                height: 20    ,
                framewidth: 20,
                frameheight: 34,
                image: game.tank_sheet, region: 'bullet',
                anchorPoint: {x:0,y:0},
                angle: this.angleGun || 0,
                shootedBy: this.body.collisionType
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

        this.stop(null);

        const tank = this.getChildByName('TankEntity')[0];
        const gun = this.getChildByName('GunEntity')[0];

        tank.renderable.flicker(500);
        gun.renderable.flicker(500, () => {

            if (this.name == 'TankContainer') {
                me.device.vibrate(1000);
                this.respawn();
            }


        });


    }

    respawn() {

        me.audio.play("cling");

        this.pos.x =  Math.random() * (me.game.world.width - 300) + 300;
        this.pos.y = Math.random() * (me.game.world.height - 300) + 300;

        // send multiplayer data
        game.mp = {...game.mp, ...{
                x: this.pos.x,
                y: this.pos.y,
            }};
        Mp.send({...game.mp});

    }

/*
    startGun(joystickRight, e) {

        me.audio.playTrack("gun", 0.4);

        this.centerGunPointer = {
            x: joystickRight.pos.x + joystickRight.width / 2,
            y: joystickRight.pos.y + joystickRight.height / 2,
        };

    }

    stopGun(e) {

        me.audio.stopTrack("gun");

    }

    rotateGun(e) {

        var position = e.pos;
        var center = this.centerGunPointer;


        // angle in radians
        var radians = Math.atan2(position.y - center.y, position.x - center.x);

        // angle in degrees
        var degrees = Math.atan2(position.y - center.y, position.x - center.x) * 180 / Math.PI;

        degrees += 90;

        if (position.x < 0 ) {
            degrees += 180;
        } else if(position.y < 0 ) {
            degrees += 360;
        }



        const gun = this.getChildByName('GunEntity')[0];

        this.angleGun += (degrees + this.prevGunDegrees) * (Math.PI / 180);

        gun.centerRotate(this.prevGunDegrees);
        gun.centerRotate(degrees);


        game.mp.angleGun = this.angleGun;
        game.mp.gunDegrees = degrees;

        Mp.send({...game.mp});

        setTimeout(() => {
            game.mp.gunDegrees = 0;
        }, 100);


        this.prevGunDegrees = -degrees;
        this.prevPosGun = e.pos;

    }
*/

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

        this.isStarted = true;

        me.audio.playTrack("tank", 0.5);


        this.centerPointer = {
            x: e.pos.x,
            y: e.pos.y
        };

        this.speedx = 0;
        this.speedy = 0;


    }

    stop(e) {

        this.isStarted = false;

        me.audio.stopTrack("tank");

        this.speedx = 0;
        this.speedy = 0;

    }

    move(e) {

        if (!this.isStarted) return;

        var position = e.pos;
        var center = this.centerPointer;

        // angle in radians
        var radians = Math.atan2(position.y - center.y, position.x - center.x);

        // angle in degrees
        var degrees = Math.atan2(position.y - center.y, position.x - center.x) * 180 / Math.PI;

        degrees += 90;

        if (position.x < 0 ) {
            degrees += 180;
        } else if(position.y < 0 ) {
            degrees += 360;
        }




        if (this.speedx == 0) {
            this.speedx = 2;
            this.speedy = 2;
        }

        //console.log('degree', Math.floor(degrees));

        if ((degrees - this.prevDegrees) > 120 && (degrees - this.prevDegrees) < 240) {
            this.speedx = -2;
            this.speedy = -2;

            //console.log('inversione');
        } else {
            const tank = this.getChildByName('TankEntity')[0];
            tank.centerRotate(degrees - this.prevDegrees);

            const gun = this.getChildByName('GunEntity')[0];
            gun.centerRotate(degrees - this.prevDegrees);

            this.angle += (degrees - this.prevDegrees) * (Math.PI / 180);
            this.angleGun += (degrees - this.prevDegrees) * (Math.PI / 180);

            this.prevDegrees = degrees;
        }



        game.mp = {...game.mp, ...{
                angle: this.angle,
                angleGun: this.angleGun,
                tankDegrees: degrees,
            }};




    }

    // centerRotate (deg) {
    //     this
    //         .translate((this.pos.x + this.width) / 2, (this.pos.y + this.width) / 2)
    //         .rotate(deg * Math.PI / 180)
    //         .translate(-(this.pos.x + this.width) / 2, -(this.pos.y + this.width) / 2);
    // }

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

        this.renderable.flipY(true).flipX(true);

    }

    centerRotate (deg) {

        this.renderable.currentTransform
            .translate(this.renderable.width / 2, this.renderable.height / 2)
            .rotate(deg * Math.PI / 180)
            .translate(-this.renderable.width / 2, -this.renderable.height / 2);
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
            .translate(this.renderable.width / 2, this.renderable.height - 10)
            .rotate(deg * Math.PI / 180)
            .translate(-this.renderable.width / 2, -(this.renderable.height - 10));

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
            .translate((this.renderable.width) / 2, (this.renderable.height -83) / 2  )
            .rotate(settings.angle)
            .translate(-(this.renderable.width) / 2, -(this.renderable.height) / 2 );


        // remove after 1 sec
        me.timer.setInterval(() => {

            if (this && this.renderable) {

                const opacity = this.renderable.getOpacity();

                if (opacity <= 0) {
                    if (this.ancestor) {
                        this.ancestor.removeChild(this);
                    }
                } else {
                    this.renderable.setOpacity( opacity - 0.1);
                }

            }
        }, 1000);

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
            .translate((this.renderable.width) / 2, (this.renderable.height + 32) )
            .rotate(settings.angle)
            .translate(-(this.renderable.width) / 2, -(this.renderable.height + 32) );


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



        this.renderable.currentTransform
            .translate((this.renderable.width) / 2, (this.renderable.height) )
            .rotate(this.settings.angle)
            .translate(-(this.renderable.width) / 2, -(this.renderable.height) );

        this.alwaysUpdate = true;
    }

    update (time) {

        //this.body.vel.x += this.body.accel.x * time / 1000 * (Math.sin(this.settings.angle));
        //this.body.vel.y -= this.body.accel.y * time / 1000 * (Math.cos(this.settings.angle));

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

        //return true;
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
            Mp.send({...game.mp});

            setTimeout(() => {
                game.mp.hit = false;
            }, 100);

            return true;

        }


/*
        if (this.ancestor.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            // shoot by player
            if (other.body.collisionType === me.collision.types.ENEMY_OBJECT) {
                console.log('colpito il nemico');

                game.data.score += 10;

                if(this.ancestor) {
                    this.ancestor.removeChild(this);
                }

                other.explode();


                return true;
            }

        } else if (this.ancestor.body.collisionType === me.collision.types.ENEMY_OBJECT) {
            // shoot by enemy
            if (other.body.collisionType === me.collision.types.PLAYER_OBJECT) {
                console.log('colpito dal nemico');

                if(this.ancestor) {
                    this.ancestor.removeChild(this);
                }

                other.explode();


                // send multiplayer data
                game.mp.hit = true;
                Mp.send({...game.mp});

                setTimeout(() => {
                    game.mp.hit = false;
                }, 100);

                return true;
            }
        }*/

        game.mp.hit = false;

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

        // // create the font object
        // this.font = new me.BitmapFont(me.loader.getBinary('PressStart2P'), me.loader.getImage('PressStart2P'));
        //
        // // font alignment to right, bottom
        // this.font.textAlign = "left";
        // this.font.textBaseline = "top";
        // this.font.alpha = 0.5;

    }

    /**
     * update function
     */
    update(dt) {

        return true;
    }

    /**
     * draw the player name
     */
    draw(renderer) {
        // this.pos.x, this.pos.y are the relative position from the screen right bottom
        // this.font.draw(renderer, this.playername, this.pos.x, this.pos.y);
        // this.font.resize(0.75);
    }
}
