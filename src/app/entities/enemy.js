import {me} from 'melonjs';
import TankContainer from './tank';
import game from "../game";
import Mp from "../multiplayer";

export default class EnemyContainer extends TankContainer {

    init(x, y, playername, w, h) {
        // call the constructor
        this._super(me.Container, 'init', [x, y, w, h]);

        // give a name
        this.name = "EnemyContainer";

        this.playername = playername;

        this.setVar();
        this.mount();
        this.setBody();

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;

        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");


    }

    setData(data) {

        const pNameEntity = this.getChildByName('PlayerNameEntity')[0];

        if (!pNameEntity) {
            //player name
            console.log('aggiungo il nome');
            this.addChild(me.pool.pull("PlayerNameEntity", this.width, -10, data.playername), 20);
        }



        this.pos.x = data.x;
        this.pos.y = data.y;
        this.angle = data.angle;

        this.angleGun = data.angleGun;

        const tank = this.getChildByName('TankEntity')[0];
        const gun = this.getChildByName('GunEntity')[0];

        if (this.prevDegrees !== data.tankDegrees) {
            tank.centerRotate( data.tankDegrees - this.prevDegrees );
            gun.centerRotate( data.tankDegrees - this.prevDegrees );
        }
        this.prevDegrees = data.tankDegrees;


        if (data.gunDegrees !== 0) {
            gun.centerRotate(this.prevGunDegrees);
            gun.centerRotate(data.gunDegrees);

            this.prevGunDegrees = -data.gunDegrees;
        }

        if(data.hit) {
            this.explode();
        }

        if(data.shoot) {
            this.shoot();
        }
    }

    shoot() {

        const gun = this.getChildByName('GunEntity')[0];

        me.audio.play("shoot", false, null, 0.5);


        this.addChild(me.pool.pull("FireEntity",
            (this.width / 2) - 32,
            -60,
            {
                name: 'FireEntity',
                width: 64,
                height: 64,
                frameheight: 64,
                framewidth: 64,
                image: 'fire4',
                anchorPoint: {x:0,y:0},
                angle: this.angleGun || 0
            }
        ), 15);


        this.addChild(me.pool.pull("BulletEntity",
            (this.width / 2) - 6,
            (this.height / 2) - 26,
            {
                name: 'BulletEntity',
                width: 12,
                height: 12,
                frameheight: 26,
                framewidth: 12,
                image: 'bullet',
                anchorPoint: {x:0,y:0},
                angle: this.angleGun || 0,
                shootedBy: this.body.collisionType
            }
        ), 15);

    }

    update(dt) {


        // let moveAngle = 0;
        //
        // let speed = 0;
        //
        // if (me.input.isKeyPressed('up')) {
        //     speed = 1;
        // }
        // if (me.input.isKeyPressed('down')) {
        //     speed = -1;
        // }
        // if (me.input.isKeyPressed('left')) {
        //     moveAngle = -1;
        // }
        // if (me.input.isKeyPressed('right')) {
        //     moveAngle = 1;
        // }
        //
        // this.angle += moveAngle * Math.PI / 180;
        //
        //
        // this.pos.x += (speed * Math.sin(this.angle));
        // this.pos.y -= (speed * Math.cos(this.angle));

        // add tracks
        this.addTracks();

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        this.updateChildBounds();

        // handle collisions against other shapes
        me.collision.check(this);


        return this._super(me.Container, "update", [dt]);

    }

    /**
     * collision handler
     */
    onCollision(response, other) {
        return false;
    }

}
