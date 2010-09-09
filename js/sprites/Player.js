/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.Player');

goog.require('goog.events');
goog.require('dotprod.Camera');
goog.require('dotprod.input.Keyboard');
goog.require('dotprod.layers.MapLayer');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @extends {dotprod.sprites.Sprite}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Camera} camera
 * @param {!dotprod.layers.MapLayer} mapLayer
 * @param {string} name
 */
dotprod.sprites.Player = function(game, camera, mapLayer, name) {
  dotprod.sprites.Sprite.call(this);

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
   * @type {!dotprod.layers.MapLayer}
   * @private
   */
  this.mapLayer_ = mapLayer;

  /**
   * @type {string}
   * @private
   */
  this.name_ = name;

  /**
   * @type {number}
   * @private
   */
  this.ship_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.xVelocity_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.yVelocity_ = 0;

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

  this.setShip(0);
};
goog.inherits(dotprod.sprites.Player, dotprod.sprites.Sprite);

/**
 * @param {number} ship
 */
dotprod.sprites.Player.prototype.setShip = function(ship) {
  this.x_ = 8192;
  this.y_ = 8192;
  this.xRadius_ = this.settings_['ships'][this.ship_]['xRadius'];
  this.yRadius_ = this.settings_['ships'][this.ship_]['yRadius'];
  this.ship_ = ship;
  this.image_ = this.game_.getResourceManager().getTiledImage('ship' + this.ship_);
};

/**
 * @param {number} timeDiff
 */
dotprod.sprites.Player.prototype.update = function(timeDiff) {
  var shipSettings = this.settings_['ships'][this.ship_];
  var shipRotation = shipSettings['rotationRadiansPerTick'];
  var shipSpeed = shipSettings['speedPixelsPerTick'];
  var acceleration = shipSettings['accelerationPerTick'];
  var bounceFactor = shipSettings['bounceFactor'];

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
    this.xVelocity_ += Math.sin(this.angleInRadians_) * acceleration * timeDiff;
    this.yVelocity_ -= Math.cos(this.angleInRadians_) * acceleration * timeDiff;
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.DOWN)) {
    this.xVelocity_ -= Math.sin(this.angleInRadians_) * acceleration * timeDiff;
    this.yVelocity_ += Math.cos(this.angleInRadians_) * acceleration * timeDiff;
  }

  // Magnitude of speed is greater than maximum ship speed - clamp.
  var magSquared = this.xVelocity_ * this.xVelocity_ + this.yVelocity_ * this.yVelocity_;
  if (magSquared >= shipSpeed * shipSpeed) {
    var magnitude = Math.sqrt(magSquared);
    this.xVelocity_ = this.xVelocity_ * shipSpeed / magnitude;
    this.yVelocity_ = this.yVelocity_ * shipSpeed / magnitude;
  }

  this.x_ += this.xVelocity_ * timeDiff;
  var collisionRect = this.mapLayer_.getCollision(this);
  if (collisionRect) {
    this.x_ = this.xVelocity_ >= 0 ? collisionRect.left : collisionRect.right;
    this.xVelocity_ = -this.xVelocity_ * bounceFactor;
  }

  this.y_ += this.yVelocity_ * timeDiff;
  collisionRect = this.mapLayer_.getCollision(this);
  if (collisionRect) {
    this.y_ = this.yVelocity_ >= 0 ? collisionRect.top : collisionRect.bottom;
    this.yVelocity_ = -this.yVelocity_ * bounceFactor;
  }

  this.camera_.setPosition(Math.floor(this.x_), Math.floor(this.y_));
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.sprites.Player.prototype.render = function(camera) {
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles());
  var dimensions = camera.getDimensions();
  var context = camera.getContext();

  var x = Math.floor((dimensions.width - this.image_.getTileWidth()) / 2);
  var y = Math.floor((dimensions.height - this.image_.getTileHeight()) / 2);

  this.image_.render(context, x, y, tileNum);

  context.save();
    context.font = '12pt Verdana';
    context.fillStyle = 'rgb(200, 200, 200)';
    context.textAlign = 'center';
    context.fillText(this.name_, dimensions.width / 2, dimensions.height / 2 + this.image_.getTileHeight());
  context.restore();
};
