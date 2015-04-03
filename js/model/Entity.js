goog.provide('model.Entity');

goog.require('goog.asserts');
goog.require('math.Rect');
goog.require('math.Vector');
goog.require('model.ModelObject');
goog.require('ObjectType');
goog.require('TileType');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @param {!Game} game
 */
model.Entity = function(game) {
  goog.base(this, game.getSimulation());

  /**
   * @type {!Game}
   * @protected
   */
  this.game_ = game;

  /**
   * @type {!math.Vector}
   * @protected
   */
  this.position_ = math.Vector.ZERO;

  /**
   * @type {!math.Vector}
   * @protected
   */
  this.velocity_ = math.Vector.ZERO;

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
goog.inherits(model.Entity, model.ModelObject);

/**
 * @return {!math.Vector}
 */
model.Entity.prototype.getPosition = function() {
  return this.position_;
};

/**
 * @return {!math.Vector}
 */
model.Entity.prototype.getVelocity = function() {
  return this.velocity_;
};

/**
 * return {!Object}
 */
model.Entity.prototype.getDimensions = function() {
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
    yRadius: this.yRadius_,
    boundingRect: new math.Rect(x - this.xRadius_, y - this.yRadius_, this.xRadius_ * 2, this.yRadius_ * 2)
  };
};

/**
 * @param {number=} opt_bounceFactor
 * @protected
 */
model.Entity.prototype.updatePosition_ = function(opt_bounceFactor) {
  var bounceFactor = opt_bounceFactor || 1;
  var map = this.game_.getMap();
  var prizeIndex = this.game_.getPrizeIndex();
  var flagIndex = this.game_.getFlagIndex();

  var tileWidth = map.getTileWidth();
  var xSpeed = Math.abs(this.velocity_.getX());
  for (var i = 0; i < xSpeed; i += tileWidth) {
    var xVel = this.velocity_.getX();
    var dx = Math.min(xSpeed - i, tileWidth);
    this.position_ = this.position_.add(new math.Vector(xVel < 0 ? -dx : dx, 0));

    var collision = map.getCollision(this);
    if (collision) {
      switch (collision.object) {
        case ObjectType.NONE:
          this.position_ = new math.Vector(xVel >= 0 ? collision.left : collision.right, this.position_.getY());
          this.velocity_ = new math.Vector(-xVel * bounceFactor, this.velocity_.getY() * bounceFactor);
          xSpeed *= bounceFactor;
          this.bounce_();
          break;
        case ObjectType.PRIZE:
          var prize = prizeIndex.getPrize(collision.xTile, collision.yTile);
          if (prize && this.shouldCollectPrize_(prize)) {
            this.onPrizeCollected(prize);
            prizeIndex.removePrize(prize);
          }
          break;
        case ObjectType.FLAG:
          var flag = flagIndex.getFlag(collision.xTile, collision.yTile);
          if (flag != null) {
            this.captureFlag_(flag);
          } else {
            goog.asserts.assert(false, 'Flag at ' + collision.xTile + ', ' + collision.yTile + ' not found.');
          }
          break;
        default:
          break;
      }
    }
  }

  var tileHeight = map.getTileHeight();
  var ySpeed = Math.abs(this.velocity_.getY());
  for (var i = 0; i < ySpeed; i += tileHeight) {
    var yVel = this.velocity_.getY();
    var dy = Math.min(ySpeed - i, tileHeight);
    this.position_ = this.position_.add(new math.Vector(0, yVel < 0 ? -dy : dy));

    var collision = this.game_.getMap().getCollision(this);
    if (collision) {
      switch (collision.object) {
        case ObjectType.NONE:
          this.position_ = new math.Vector(this.position_.getX(), yVel >= 0 ? collision.top : collision.bottom);
          this.velocity_ = new math.Vector(this.velocity_.getX() * bounceFactor, -yVel * bounceFactor);
          ySpeed *= bounceFactor;
          this.bounce_();
          break;
        case ObjectType.PRIZE:
          var prize = prizeIndex.getPrize(collision.xTile, collision.yTile);
          if (prize && this.shouldCollectPrize_(prize)) {
            this.onPrizeCollected(prize);
            prizeIndex.removePrize(prize);
          }
          break;
        case ObjectType.FLAG:
          var flag = flagIndex.getFlag(collision.xTile, collision.yTile);
          if (flag != null) {
            this.captureFlag_(flag);
          } else {
            goog.asserts.assert(false, 'Flag at ' + collision.xTile + ', ' + collision.yTile + ' not found.');
          }
          break;
        default:
          break;
      }
    }
  }
};

/**
 * This function should return true if the prize should be taken, false if not.
 * When the prize is actually taken, onPrizeCollected will be called.
 *
 * @param {!model.Prize} prize
 * @return {boolean}
 * @protected
 */
model.Entity.prototype.shouldCollectPrize_ = function(prize) { return false; };

/**
 * Called when this entity takes a prize. The prize may be granted by the server
 * or by the local simulation. If the prize was granted by the server and it
 * wasn't found in our model, |prize| will be null.
 *
 * @param {model.Prize} prize
 */
 model.Entity.prototype.onPrizeCollected = goog.abstractMethod;

/**
 * @param {!model.Flag} flag
 * @protected
 */
model.Entity.prototype.captureFlag_ = goog.nullFunction;

/**
 * @protected
 */
model.Entity.prototype.bounce_ = goog.nullFunction;
