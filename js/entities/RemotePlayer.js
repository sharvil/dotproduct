/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.RemotePlayer');

goog.require('dotprod.Camera');
goog.require('dotprod.entities.Player');
goog.require('dotprod.Map');
goog.require('dotprod.TiledImage');

/**
 * @constructor
 * @extends {dotprod.entities.Player}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Map} map
 * @param {string} name
 * @param {number} ship
 */
dotprod.entities.RemotePlayer = function(game, map, name, ship) {
  dotprod.entities.Player.call(this, game, name);

  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!dotprod.Map}
   * @private
   */
  this.map_ = map;

  this.setShip(ship);
};
goog.inherits(dotprod.entities.RemotePlayer, dotprod.entities.Player);

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.entities.RemotePlayer.MAX_DRIFT_PIXELS_ = 64;

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.entities.RemotePlayer.VELOCITY_ADJUST_PERIOD_ = 20;

/**
 * @param {number} timeDiff
 * @param {number} angle
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 */
dotprod.entities.RemotePlayer.prototype.positionUpdate = function(timeDiff, angle, position, velocity) {
  var finalPosition = position.add(velocity.scale(timeDiff));
  var distance = finalPosition.subtract(this.position_);

  this.angleInRadians_ = angle;
  this.velocity_ = velocity;

  if (Math.abs(distance.getX()) >= dotprod.entities.RemotePlayer.MAX_DRIFT_PIXELS_) {
    this.position_ = new dotprod.Vector(finalPosition.getX(), this.position_.getY());
  } else {
    this.velocity_ = this.velocity_.add(new dotprod.Vector(distance.getX(), 0).scale(1 / dotprod.entities.RemotePlayer.VELOCITY_ADJUST_PERIOD_));
  }

  if (Math.abs(distance.getY()) >= dotprod.entities.RemotePlayer.MAX_DRIFT_PIXELS_) {
    this.position_ = new dotprod.Vector(this.position_.getX(), finalPosition.getY());
  } else {
    this.velocity_ = this.velocity_.add(new dotprod.Vector(0, distance.getY()).scale(1 / dotprod.entities.RemotePlayer.VELOCITY_ADJUST_PERIOD_));
  }
};

/**
 * @param {number} timeDiff
 */
dotprod.entities.RemotePlayer.prototype.update = function(timeDiff) {
  var bounceFactor = this.game_.getSettings()['ships'][this.ship_]['bounceFactor'];
  this.updatePosition_(timeDiff, bounceFactor);
};
