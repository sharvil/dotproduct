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
   * @type {number}
   * @private
   */
  this.ship_ = 0;

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
  this.angleInRadians_ += timeDiff * 0.05;
  if (this.angleInRadians_ >= Math.PI * 2) {
    this.angleInRadians_ = 0;
  }

  var keyboard = this.game_.getKeyboard();
  var dimensions = this.camera_.getDimensions();
  var magnitude = timeDiff * 5;

  if (keyboard.isKeyPressed(goog.events.KeyCodes.SHIFT)) {
    magnitude *= 4;
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.UP)) {
    dimensions.y -= magnitude;
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.DOWN)) {
    dimensions.y += magnitude;
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.LEFT)) {
    dimensions.x -= magnitude;
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.RIGHT)) {
    dimensions.x += magnitude;
  }

  this.camera_.setPosition(dimensions.x, dimensions.y);
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.Player.prototype.render = function(camera) {
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles());
  this.image_.render(camera.getContext(), 0, 0, tileNum);
};
