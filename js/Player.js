/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Player');

goog.require('goog.events');
goog.require('dotprod.Camera');
goog.require('dotprod.input.Keyboard');

/**
 * @constructor
 * @param {!dotprod.Game} game
 * @param {!dotprod.Camera} camera
 */
dotprod.Player = function(game, camera) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = game.getConfig().getSettings();

  /**
   * @type {number}
   * @private
   */
  this.ship_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.x_ = 8192;

  /**
   * @type {number}
   * @private
   */
  this.y_ = 8192;

  /**
   * @type {number}
   * @private
   */
  this.speedX_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.speedY_ = 0;

  /**
   * @type {!dotprod.TiledImage}
   * @private
   */
  this.image_ = game.getResourceManager().getTiledImage('ship' + this.ship_);

  /**
   * @type {number}
   * @private
   */
  this.angleInRadians_ = 0;

  /**
   * @type {!dotprod.Camera} camera
   * @private
   */
  this.camera_ = camera;
};

/**
 * @param {number} ship
 */
dotprod.Player.prototype.setShip = function(ship) {
  this.ship_ = ship;
  this.image_ = this.game_.getResourceManager().getTiledImage('ship' + this.ship_);
};

/**
 * @param {number} timeDiff
 */
dotprod.Player.prototype.update = function(timeDiff) {
  var shipSettings = this.settings_['ships'][this.ship_];
  var shipRotation = shipSettings['rotationRadiansPerTick'];
  var shipSpeed = shipSettings['speedPixelsPerTick'];
  var acceleration = shipSettings['accelerationPerTick'];

  var keyboard = this.game_.getKeyboard();
  var dimensions = this.camera_.getDimensions();

  if (keyboard.isKeyPressed(goog.events.KeyCodes.LEFT)) {
    this.angleInRadians_ -= timeDiff * shipRotation;
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.RIGHT)) {
    this.angleInRadians_ += timeDiff * shipRotation;
  }

  if (this.angleInRadians_ < 0 || this.angleInRadians_ >= Math.PI * 2) {
    this.angleInRadians_ -= Math.floor(this.angleInRadians_ / (2 * Math.PI)) * 2 * Math.PI;
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.UP)) {
    this.speedX_ += Math.sin(this.angleInRadians_) * acceleration * timeDiff;
    this.speedY_ -= Math.cos(this.angleInRadians_) * acceleration * timeDiff;
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.DOWN)) {
    this.speedX_ -= Math.sin(this.angleInRadians_) * acceleration * timeDiff;
    this.speedY_ += Math.cos(this.angleInRadians_) * acceleration * timeDiff;
  }

  // Magnitude of speed is greater than maximum ship speed - clamp.
  var magSquared = this.speedX_ * this.speedX_ + this.speedY_ * this.speedY_;
  if (magSquared >= shipSpeed * shipSpeed) {
    var magnitude = Math.sqrt(magSquared);
    this.speedX_ = this.speedX_ * shipSpeed / magnitude;
    this.speedY_ = this.speedY_ * shipSpeed / magnitude;
  }

  this.x_ += this.speedX_ * timeDiff;
  this.y_ += this.speedY_ * timeDiff;

  this.camera_.setPosition(Math.floor(this.x_), Math.floor(this.y_));
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.Player.prototype.render = function(camera) {
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles());
  var dimensions = camera.getDimensions();
  this.image_.render(camera.getContext(), Math.floor((dimensions.width - this.image_.getTileWidth()) / 2), Math.floor((dimensions.height - this.image_.getTileHeight()) / 2), tileNum);
};
