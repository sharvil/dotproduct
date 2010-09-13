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
  dotprod.entities.Player.call(this, name);

  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = game.getSettings();

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
   * @type {number}
   * @private
   */
  this.ship_ = 0;

  /**
   * @type {!Object}
   * @private
   */
  this.shipSettings_ = this.settings_['ships'][this.ship_];

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

  this.setShip(0);

  // TODO(sharvil): hack - fix me. Don't create a new timer and change frequency of updates
  // based on player activity (i.e. more frequent updates when accelerating / rotating).
  var self = this;
  window.setInterval(function() {
    self.game_.getProtocol().sendPosition(self.angleInRadians_, self.position_, self.velocity_);
  }, 250);
};
goog.inherits(dotprod.entities.LocalPlayer, dotprod.entities.Player);

/**
 * @param {number} ship
 */
dotprod.entities.LocalPlayer.prototype.setShip = function(ship) {
  this.ship_ = ship;
  this.shipSettings_ = this.settings_['ships'][this.ship_];

  this.position_ = new dotprod.Vector(8192, 8192);
  this.xRadius_ = this.shipSettings_['xRadius'];
  this.yRadius_ = this.shipSettings_['yRadius'];
  this.image_ = this.game_.getResourceManager().getTiledImage('ship' + this.ship_);
};

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

  this.projectileFireDelay_ = Math.max(this.projectileFireDelay_ - 1, 0);

  if (this.projectileFireDelay_ <= 0) {
    if (keyboard.isKeyPressed(goog.events.KeyCodes.CTRL)) {
      var front = new dotprod.Vector(0, -this.yRadius_).rotate(this.angleInRadians_).add(this.position_);
      var velocity = this.velocity_.add(dotprod.Vector.fromPolar(bulletSpeed, this.angleInRadians_));
      this.projectileIndex_.addProjectile(this, new dotprod.entities.Bullet(this.map_, front, velocity));
      this.projectileFireDelay_ = bulletFireDelay;
    }
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.LEFT)) {
    this.angleInRadians_ -= timeDiff * shipRotation;
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.RIGHT)) {
    this.angleInRadians_ += timeDiff * shipRotation;
  }

  if (this.angleInRadians_ < 0 || this.angleInRadians_ >= Math.PI * 2) {
    this.angleInRadians_ -= Math.floor(this.angleInRadians_ / (2 * Math.PI)) * 2 * Math.PI;
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.UP)) {
    this.velocity_ = this.velocity_.add(dotprod.Vector.fromPolar(acceleration * timeDiff, this.angleInRadians_));
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.DOWN)) {
    this.velocity_ = this.velocity_.subtract(dotprod.Vector.fromPolar(acceleration * timeDiff, this.angleInRadians_));
  }

  // Magnitude of speed is greater than maximum ship speed - clamp.
  var magnitude = this.velocity_.magnitude();
  if (magnitude >= shipSpeed) {
    this.velocity_ = this.velocity_.scale(shipSpeed / magnitude);
  }

  this.updatePosition_(timeDiff, bounceFactor);
  this.camera_.setPosition(Math.floor(this.position_.getX()), Math.floor(this.position_.getY()));
};
