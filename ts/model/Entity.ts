import Rect from 'math/Rect';
import Vector from 'math/Vector';
import ModelObject from 'model/ModelObject';
import Flag from 'model/Flag';
import Prize from 'model/Prize';
import { TileType, ObjectType } from 'types';
import Game from 'ui/Game';

abstract class Entity extends ModelObject {
  protected game_ : Game;
  protected position_ : Vector;
  protected velocity_ : Vector;
  protected radius_ : number;

  constructor(game : Game) {
    super(game.getSimulation());

    this.game_ = game;
    this.position_ = Vector.ZERO;
    this.velocity_ = Vector.ZERO;
    this.radius_ = 0;
  }

  public getPosition() : Vector {
    return this.position_;
  }

  public getVelocity() : Vector {
    return this.velocity_;
  }

  public getDimensions() : any {
    let x = this.position_.x;
    let y = this.position_.y;

    return {
      x: x,
      y: y,
      left: x - this.radius_,
      right: x + this.radius_,
      top: y - this.radius_,
      bottom: y + this.radius_,
      width: this.radius_ * 2,
      height: this.radius_ * 2,
      radius: this.radius_,
      boundingRect: new Rect(x - this.radius_, y - this.radius_, this.radius_ * 2, this.radius_ * 2)
    };
  }

  protected updatePosition_(bounceFactor? : number) {
    let map = this.game_.getMap();
    let prizeIndex = this.game_.getPrizeIndex();
    let flagIndex = this.game_.getFlagList();
    bounceFactor = bounceFactor || 1;

    let tileWidth = map.getTileWidth();
    let xSpeed = Math.abs(this.velocity_.x);
    for (let i = 0; i < xSpeed; i += tileWidth) {
      let xVel = this.velocity_.x;
      let dx = Math.min(xSpeed - i, tileWidth);
      this.position_ = this.position_.add(new Vector(xVel < 0 ? -dx : dx, 0));

      let collision = map.getCollision(this);
      if (collision) {
        switch (collision.object) {
          case ObjectType.NONE:
            this.position_ = new Vector(xVel >= 0 ? collision.left : collision.right, this.position_.y);
            this.velocity_ = new Vector(-xVel * bounceFactor, this.velocity_.y * bounceFactor);
            xSpeed *= bounceFactor;
            this.bounce_();
            break;
          case ObjectType.PRIZE:
            let prize = prizeIndex.getPrize(collision.xTile, collision.yTile);
            if (prize && this.shouldCollectPrize_(prize)) {
              this.onPrizeCollected(prize);
              prizeIndex.removePrize(prize);
            }
            break;
          case ObjectType.FLAG:
            let flag = flagIndex.getFlag(collision.xTile, collision.yTile);
            if (flag != null) {
              this.captureFlag_(flag);
            } else {
              assert(false, 'Flag at ' + collision.xTile + ', ' + collision.yTile + ' not found.');
            }
            break;
          default:
            break;
        }
      }
    }

    let tileHeight = map.getTileHeight();
    let ySpeed = Math.abs(this.velocity_.y);
    for (let i = 0; i < ySpeed; i += tileHeight) {
      let yVel = this.velocity_.y;
      let dy = Math.min(ySpeed - i, tileHeight);
      this.position_ = this.position_.add(new Vector(0, yVel < 0 ? -dy : dy));

      let collision = this.game_.getMap().getCollision(this);
      if (collision) {
        switch (collision.object) {
          case ObjectType.NONE:
            this.position_ = new Vector(this.position_.x, yVel >= 0 ? collision.top : collision.bottom);
            this.velocity_ = new Vector(this.velocity_.x * bounceFactor, -yVel * bounceFactor);
            ySpeed *= bounceFactor;
            this.bounce_();
            break;
          case ObjectType.PRIZE:
            let prize = prizeIndex.getPrize(collision.xTile, collision.yTile);
            if (prize && this.shouldCollectPrize_(prize)) {
              this.onPrizeCollected(prize);
              prizeIndex.removePrize(prize);
            }
            break;
          case ObjectType.FLAG:
            let flag = flagIndex.getFlag(collision.xTile, collision.yTile);
            if (flag != null) {
              this.captureFlag_(flag);
            } else {
              assert(false, 'Flag at ' + collision.xTile + ', ' + collision.yTile + ' not found.');
            }
            break;
          default:
            break;
        }
      }
    }
  }

  /**
   * This function should return true if the prize should be taken, false if not.
   * When the prize is actually taken, onPrizeCollected will be called.
   */
  protected shouldCollectPrize_(prize : Prize) : boolean { return false; }

  protected captureFlag_(flag : Flag) {}

  protected bounce_() {}

  /**
   * Called when this entity takes a prize. The prize may be granted by the server
   * or by the local simulation. If the prize was granted by the server and it
   * wasn't found in our model, |prize| will be null.
   */
  public abstract onPrizeCollected(prize : Prize | null) : void;
}

export default Entity;
