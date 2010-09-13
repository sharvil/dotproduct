/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.RemotePlayer');

goog.require('dotprod.Camera');
goog.require('dotprod.Map');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @extends {dotprod.sprites.Sprite}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Map} map
 * @param {string} name
 * @param {number} ship
 */
dotprod.sprites.RemotePlayer = function(game, map, name, ship) {
  dotprod.sprites.Sprite.call(this);

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

  /**
   * @type {string}
   * @private
   */
  this.name_ = name;

  /**
   * @type {number}
   * @private
   */
  this.angleInRadians_ = 0;

  this.image_ = game.getResourceManager().getTiledImage('ship' + ship);
};
goog.inherits(dotprod.sprites.RemotePlayer, dotprod.sprites.Sprite);

/**
 * @param {!Object} packet
 */
dotprod.sprites.RemotePlayer.prototype.positionUpdate = function(packet) {
  this.angleInRadians_ = packet[1];
  this.position_ = new dotprod.Vector(packet[2], packet[3]);
  this.velocity_ = new dotprod.Vector(packet[4], packet[5]);
};

/**
 * @param {number} timeDiff
 */
dotprod.sprites.RemotePlayer.prototype.update = function(timeDiff) {
  // TODO(sharvil): grab from ship settings.
  var bounceFactor = 0.5;

  this.position_ = this.position_.add(this.velocity_.getXComponent().scale(timeDiff));
  var collisionRect = this.map_.getCollision(this);
  if (collisionRect) {
    var xVel = this.velocity_.getX();
    this.position_ = new dotprod.Vector(xVel >= 0 ? collisionRect.left : collisionRect.right, this.position_.getY());
    this.velocity_ = new dotprod.Vector(-xVel * bounceFactor, this.velocity_.getY());
  }

  this.position_ = this.position_.add(this.velocity_.getYComponent().scale(timeDiff));
  collisionRect = this.map_.getCollision(this);
  if (collisionRect) {
    var yVel = this.velocity_.getY();
    this.position_ = new dotprod.Vector(this.position_.getX(), yVel >= 0 ? collisionRect.top : collisionRect.bottom);
    this.velocity_ = new dotprod.Vector(this.velocity_.getX(), -yVel * bounceFactor);
  }
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.sprites.RemotePlayer.prototype.render = function(camera) {
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles());
  var dimensions = camera.getDimensions();
  var context = camera.getContext();

  var x = Math.floor(this.position_.getX() - dimensions.left - this.image_.getTileWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.image_.getTileHeight() / 2);

  this.image_.render(context, x, y, tileNum);

  context.save();
    context.font = '12pt Verdana';
    context.fillStyle = 'rgb(200, 200, 200)';
    context.textAlign = 'center';
    context.fillText(this.name_, x + this.image_.getTileWidth() / 2, y + 3 / 2 * this.image_.getTileHeight());
  context.restore();
};

/**
 * @return {string}
 */
dotprod.sprites.RemotePlayer.prototype.getName = function() {
  return this.name_;
};
