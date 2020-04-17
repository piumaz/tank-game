import {me} from 'melonjs';
import game from './../game';

/**
 * a Coin entity
 */
export default class CoinEntity extends me.CollectableEntity {

    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init(x, y, settings) {
        // call the parent constructor
        this._super(me.CollectableEntity, 'init', [x, y , settings]);

    }

    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision() {
        // do something when collected

        // play a "coin collected" sound
        me.audio.play("cling");

        // give some score
        game.data.score += 50;

        // make sure it cannot be collected "again"
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);

        // remove it
        me.game.world.removeChild(this);
    }
}

/**
 * an enemy Entity
 */
/*
game.EnemyEntity = me.Sprite.extend({
    init: function (x, y, settings) {
        // save the area size as defined in Tiled
        var width = settings.width;

        // define this here instead of tiled
        settings.image = "wheelie_right";

        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.framewidth = settings.width = 64;
        settings.frameheight = settings.height = 64;

        // call the parent constructor
        this._super(me.Sprite, 'init', [x, y , settings]);

        // add a physic body
        this.body = new me.Body(this);

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;

        // add a default collision shape
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));
        // configure max speed and friction
        this.body.setMaxVelocity(4, 6);
        this.body.setFriction(0.4, 0);
        // enable physic collision (off by default for basic me.Renderable)
        this.isKinematic = false;

        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.pos.x = this.endX = x + width - this.width;
        //this.pos.x  = x + width - this.width;

        // to remember which side we were walking
        this.walkLeft = false;

        // make it "alive"
        this.alive = true;
    },

    // manage the enemy movement
    update : function (dt) {
        if (this.alive)
        {
            if (this.walkLeft && this.pos.x <= this.startX)
            {
                this.walkLeft = false;
                this.body.force.x = this.body.maxVel.x;
            }
            else if (!this.walkLeft && this.pos.x >= this.endX)
            {
                this.walkLeft = true;
                this.body.force.x = -this.body.maxVel.x;
            }

            this.flipX(this.walkLeft);
        }
        else
        {
            this.body.force.x = 0;
        }
        // check & update movement
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    /!**
     * colision handler
     * (called when colliding with other objects)
     *!/
    onCollision : function (response, other) {
        /!*
        if (response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
            // res.y >0 means touched by something on the bottom
            // which mean at top position for this one
            if (this.alive && (response.overlapV.y > 0) && response.a.body.falling) {
                this.renderable.flicker(750);
            }
            return false;
        }
        *!/

        // Make all other objects solid
        return true;
    }
});
*/
