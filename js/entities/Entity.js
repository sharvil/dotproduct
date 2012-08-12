/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Entity');

goog.require('dotprod.Vector');

/**
 * @constructor
 * @param {!dotprod.Game} game
 */
dotprod.entities.Entity = function(game) {
  /**
   * @type {!dotprod.Game}
   * @protected
   */
  this.game_ = game;

  /**
   * @type {!dotprod.Vector}
   * @protected
   */
  this.position_ = new dotprod.Vector(0, 0);

  /**
   * @type {!dotprod.Vector}
   * @protected
   */
  this.velocity_ = new dotprod.Vector(0, 0);

  /**
   * @type {number}
   * @protected
   */
  this.xRadius_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.yRadius_ = 0;
};

/**
 * @return {!dotprod.Vector}
 */
dotprod.entities.Entity.prototype.getPosition = function() {
  return this.position_;
};

/**
 * @return {!dotprod.Vector}
 */
dotprod.entities.Entity.prototype.getVelocity = function() {
  return this.velocity_;
};

/**
 * return {!Object}
 */
dotprod.entities.Entity.prototype.getDimensions = function() {
  var x = this.position_.getX();
  var y = this.position_.getY();

  return {
    x: x,
    y: y,
    left: x - this.xRadius_,
    right: x + this.xRadius_,
    top: y - this.yRadius_,
    bottom: y + this.yRadius_,
    width: this.xRadius_ * 2,
    height: this.yRadius_ * 2,
    xRadius: this.xRadius_,
    yRadius: this.yRadius_
  };
};

/**
 * @return {boolean}
 */
dotprod.entities.Entity.prototype.isAlive = goog.abstractMethod;


/**
 * @param {number=} opt_bounceFactor
 * @protected
 */
dotprod.entities.Entity.prototype.updatePosition_ = function(opt_bounceFactor) {
  if (!this.isAlive()) {
    return;
  }

  var bounceFactor = opt_bounceFactor || 1;
  var map = this.game_.getMap();
  var prizeIndex = this.game_.getPrizeIndex();

  var tileWidth = map.getTileWidth();
  var xSpeed = Math.abs(this.velocity_.getX());
  for (var i = 0; i < xSpeed; i += tileWidth) {
    var xVel = this.velocity_.getX();
    var dx = Math.min(xSpeed - i, tileWidth);
    this.position_ = this.position_.add(new dotprod.Vector(xVel < 0 ? -dx : dx, 0));

    var collision = map.getCollision(this);
    if (collision) {
      if (collision.tileValue == 255) {
        var prize = prizeIndex.getPrize(collision.xTile, collision.yTile);
        if (prize && this.collectPrize_(prize)) {
          prizeIndex.removePrize(prize);
        }
      } else {
        this.position_ = new dotprod.Vector(xVel >= 0 ? collision.left : collision.right, this.position_.getY());
        this.velocity_ = new dotprod.Vector(-xVel * bounceFactor, this.velocity_.getY());
        xSpeed *= bounceFactor;
        this.bounce_();
      }
    }
  }

  var tileHeight = map.getTileHeight();
  var ySpeed = Math.abs(this.velocity_.getY());
  for (var i = 0; i < ySpeed; i += tileHeight) {
    var yVel = this.velocity_.getY();
    var dy = Math.min(ySpeed - i, tileHeight);
    this.position_ = this.position_.add(new dotprod.Vector(0, yVel < 0 ? -dy : dy));

    var collision = this.game_.getMap().getCollision(this);
    if (collision) {
      if (collision.tileValue == 255) {
        var prize = prizeIndex.getPrize(collision.xTile, collision.yTile);
        if (prize && this.collectPrize_(prize)) {
          prizeIndex.removePrize(prize);
        }
      } else {
        this.position_ = new dotprod.Vector(this.position_.getX(), yVel >= 0 ? collision.top : collision.bottom);
        this.velocity_ = new dotprod.Vector(this.velocity_.getX(), -yVel * bounceFactor);
        ySpeed *= bounceFactor;
        this.bounce_();
      }
    }
  }
};

/**
 * This function takes a prize and returns true if it should be taken or
 * false if it should not be taken.
 * @protected
 * @return {boolean}
 */
dotprod.entities.Entity.prototype.collectPrize_ = goog.nullFunction;

/**
 * @protected
 */
dotprod.entities.Entity.prototype.bounce_ = goog.nullFunction;
