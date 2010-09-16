/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.LocalPlayer');

goog.require('goog.events');
goog.require('dotprod.Camera');
goog.require('dotprod.entities.Bullet');
goog.require('dotprod.entities.Player');
goog.require('dotprod.input.Keyboard');
goog.require('dotprod.layers.ProjectileLayer');
goog.require('dotprod.Map');
goog.require('dotprod.ProjectileIndex');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Player}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Camera} camera
 * @param {!dotprod.Map} map
 * @param {!dotprod.ProjectileIndex} projectileIndex
 * @param {string} name
 */
dotprod.entities.LocalPlayer = function(game, camera, map, projectileIndex, name) {
  dotprod.entities.Player.call(this, game, name);

  /**
   * @type {!dotprod.Map}
   * @private
   */
  this.map_ = map;

  /**
   * @type {!dotprod.ProjectileIndex}
   * @private
   */
  this.projectileIndex_ = projectileIndex;

  /**
   * @type {!dotprod.Camera} camera
   * @private
   */
  this.camera_ = camera;

  /**
   * @type {number}
   * @private
   */
  this.projectileFireDelay_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.ticksSincePositionUpdate_ = 0;
};
goog.inherits(dotprod.entities.LocalPlayer, dotprod.entities.Player);

/**
 * @param {number} timeDiff
 */
dotprod.entities.LocalPlayer.prototype.update = function(timeDiff) {
  var shipRotation = this.shipSettings_['rotationRadiansPerTick'];
  var shipSpeed = this.shipSettings_['speedPixelsPerTick'];
  var acceleration = this.shipSettings_['accelerationPerTick'];
  var bounceFactor = this.shipSettings_['bounceFactor'];
  var bulletFireDelay = this.shipSettings_['bullet']['fireDelay'];
  var bulletSpeed = this.shipSettings_['bullet']['speed'];

  var keyboard = this.game_.getKeyboard();
  var dimensions = this.camera_.getDimensions();

  var oldAngle = this.angleInRadians_;
  var oldVelocity = this.velocity_;

  this.ticksSincePositionUpdate_ += timeDiff;
  this.projectileFireDelay_ = Math.max(this.projectileFireDelay_ - timeDiff, 0);

  if (this.projectileFireDelay_ <= 0) {
    if (keyboard.isKeyPressed(goog.events.KeyCodes.CTRL)) {
      var front = new dotprod.Vector(0, -this.yRadius_).rotate(this.getAngle_()).add(this.position_);
      var velocity = this.velocity_.add(dotprod.Vector.fromPolar(bulletSpeed, this.angleInRadians_));
      this.projectileIndex_.addProjectile(this, new dotprod.entities.Bullet(this.map_, front, velocity));
      this.projectileFireDelay_ = bulletFireDelay;
    }
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.S)) {
    this.velocity_ = new dotprod.Vector(0, 0);
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.LEFT)) {
    this.angleInRadians_ -= timeDiff * shipRotation;
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.RIGHT)) {
    this.angleInRadians_ += timeDiff * shipRotation;
  }

  if (this.angleInRadians_ < 0 || this.angleInRadians_ >= Math.PI * 2) {
    this.angleInRadians_ -= Math.floor(this.angleInRadians_ / (2 * Math.PI)) * 2 * Math.PI;
  }

  var angle = this.getAngle_();

  if (keyboard.isKeyPressed(goog.events.KeyCodes.UP)) {
    this.velocity_ = this.velocity_.add(dotprod.Vector.fromPolar(acceleration * timeDiff, angle));
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.DOWN)) {
    this.velocity_ = this.velocity_.subtract(dotprod.Vector.fromPolar(acceleration * timeDiff, angle));
  }

  // Magnitude of speed is greater than maximum ship speed - clamp.
  var magnitude = this.velocity_.magnitude();
  if (magnitude >= shipSpeed) {
    this.velocity_ = this.velocity_.scale(shipSpeed / magnitude);
  }

  this.updatePosition_(timeDiff, bounceFactor);
  this.camera_.setPosition(Math.floor(this.position_.getX()), Math.floor(this.position_.getY()));
  this.sendPositionUpdate_(this.velocity_ != velocity || this.angleInRadians_ != oldAngle);
};

/**
 * @type {boolean} isAccelerating
 */
dotprod.entities.LocalPlayer.prototype.sendPositionUpdate_ = function(isAccelerating) {
  var sendPositionDelay = this.settings_['network']['sendPositionDelay'];
  if (isAccelerating) {
    sendPositionDelay = this.settings_['network']['fastSendPositionDelay'];
  }

  if (this.ticksSincePositionUpdate_ < sendPositionDelay) {
    return;
  }

  this.game_.getProtocol().sendPosition(this.getAngle_(), this.position_, this.velocity_);
  this.ticksSincePositionUpdate_ = 0;
};

/**
 * @return {number}
 */
dotprod.entities.LocalPlayer.prototype.getAngle_ = function() {
  return 2 * Math.PI * Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles()) / this.image_.getNumTiles();
};
