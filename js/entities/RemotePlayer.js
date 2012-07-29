/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.RemotePlayer');

goog.require('dotprod.Camera');
goog.require('dotprod.EffectIndex');
goog.require('dotprod.entities.Player');
goog.require('dotprod.Map');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Player}
 * @param {!dotprod.Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} ship
 */
dotprod.entities.RemotePlayer = function(game, id, name, ship, bounty) {
  dotprod.entities.Player.call(this, game, id, name, ship, bounty);

  /**
   * @type {number}
   * @private
   */
  this.velocityAdjustTimer_ = 0;

  // The remote player isn't alive until we receive a position packet telling
  // us otherwise.
  this.energy_ = 0;
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
dotprod.entities.RemotePlayer.prototype.onPositionUpdate = function(timeDiff, angle, position, velocity) {
  if (!this.isAlive()) {
    this.energy_ = 1;
    this.bounty_ = 0;
    this.angleInRadians_ = angle;
    this.position_ = position;
    this.velocity_ = velocity;
    this.originalVelocity_ = velocity;
    this.warpFlash();
    return;
  }

  var finalPosition = position.add(velocity.scale(timeDiff));
  var distance = finalPosition.subtract(this.position_);

  this.angleInRadians_ = angle;
  this.velocity_ = velocity;
  this.originalVelocity_ = velocity;
  this.velocityAdjustTimer_ = dotprod.entities.RemotePlayer.VELOCITY_ADJUST_PERIOD_;

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

dotprod.entities.RemotePlayer.prototype.update = function() {
  var bounceFactor = this.game_.getSettings()['ships'][this.ship_]['bounceFactor'];
  --this.velocityAdjustTimer_;
  if (this.velocityAdjustTimer_ == 0) {
    this.velocity_ = this.originalVelocity_;
  }
  this.updatePosition_(bounceFactor);
};
