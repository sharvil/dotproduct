/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Player');

goog.require('dotprod.entities.Entity');
goog.require('dotprod.Map');
goog.require('dotprod.TiledImage');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 * @param {!dotprod.Game} game
 * @param {string} name
 */
dotprod.entities.Player = function(game, name) {
  dotprod.entities.Entity.call(this);

  /**
   * @type {!dotprod.Game}
   * @protected
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @protected
   */
  this.settings_ = game.getSettings();

  /**
   * @type {!Object}
   * @protected
   */
  this.shipSettings_ = this.settings_['ships'][this.ship_];

  /**
   * @type {string}
   * @protected
   */
  this.name_ = name;

  /**
   * @type {number}
   * @protected
   */
  this.angleInRadians_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.energy_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.ship_ = 0;

  /**
   * @type {!dotprod.TiledImage}
   * @protected
   */
  this.image_;

  this.setShip(0);
};
goog.inherits(dotprod.entities.Player, dotprod.entities.Entity);

/**
 * @return {string}
 */
dotprod.entities.Player.prototype.getName = function() {
  return this.name_;
};

/**
 * @return {number}
 */
dotprod.entities.Player.prototype.getShip = function() {
  return this.ship_;
};

/**
 * @return {boolean}
 */
dotprod.entities.Player.prototype.isAlive = function() {
  return this.energy_ > 0;
};

/**
 * @param {number} ship
 */
dotprod.entities.Player.prototype.setShip = function(ship) {
  this.ship_ = ship;
  this.shipSettings_ = this.settings_['ships'][this.ship_];

  this.angleInRadians_ = Math.random() * 2 * Math.PI;
  this.position_ = new dotprod.Vector(6000, 6000);
  this.energy_ = this.shipSettings_['maxEnergy'];
  this.xRadius_ = this.shipSettings_['xRadius'];
  this.yRadius_ = this.shipSettings_['yRadius'];
  this.image_ = this.game_.getResourceManager().getTiledImage('ship' + this.ship_);
};

dotprod.entities.Player.prototype.takeDamage = goog.nullFunction;

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.Player.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

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
 * @param {!dotprod.Map} map
 * @param {number} bounceFactor
 * @protected
 */
dotprod.entities.Player.prototype.updatePosition_ = function(map, bounceFactor) {
  if (!this.isAlive()) {
    return;
  }

  this.position_ = this.position_.add(this.velocity_.getXComponent());
  var collisionRect = map.getCollision(this);
  if (collisionRect) {
    var xVel = this.velocity_.getX();
    this.position_ = new dotprod.Vector(xVel >= 0 ? collisionRect.left : collisionRect.right, this.position_.getY());
    this.velocity_ = new dotprod.Vector(-xVel * bounceFactor, this.velocity_.getY());
  }

  this.position_ = this.position_.add(this.velocity_.getYComponent());
  collisionRect = map.getCollision(this);
  if (collisionRect) {
    var yVel = this.velocity_.getY();
    this.position_ = new dotprod.Vector(this.position_.getX(), yVel >= 0 ? collisionRect.top : collisionRect.bottom);
    this.velocity_ = new dotprod.Vector(this.velocity_.getX(), -yVel * bounceFactor);
  }
};
