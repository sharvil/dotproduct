/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Player');

goog.require('dotprod.EffectIndex');
goog.require('dotprod.entities.Entity');
goog.require('dotprod.Image');
goog.require('dotprod.Map');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 * @param {!dotprod.Game} game
 * @param {string} name
 * @param {number} ship
 */
dotprod.entities.Player = function(game, name, ship) {
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
   * @protected
   */
  this.energy_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.maxEnergy_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.ship_ = ship;

  /**
   * @type {dotprod.Image}
   * @protected
   */
  this.image_;

  /**
   * @type {!dotprod.EffectIndex}
   * @private
   */
  this.effectIndex_ = this.game_.getEffectIndex();

  this.setShip(this.ship_);
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

  this.position_ = new dotprod.Vector(0, 0);
  this.velocity_ = new dotprod.Vector(0, 0);
  this.energy_ = 0;
  this.xRadius_ = this.shipSettings_['xRadius'];
  this.yRadius_ = this.shipSettings_['yRadius'];
  this.image_ = this.game_.getResourceManager().getImage('ship' + this.ship_);
};

/**
 * @param {!dotprod.entities.Player} player
 * @param {!dotprod.entities.Projectile} projectile
 * @param {number} damage
 */
dotprod.entities.Player.prototype.takeDamage = function(player, projectile, damage) {};

dotprod.entities.Player.prototype.onDeath = function() {
  var ensemble = this.game_.getResourceManager().getVideoEnsemble('explode2');
  this.effectIndex_.addEffect(new dotprod.entities.Effect(ensemble.getAnimation(0), this.position_, this.velocity_));

  ensemble = this.game_.getResourceManager().getVideoEnsemble('ship' + this.ship_ + '_junk');
  for (var i = 0; i < ensemble.getNumAnimations(); ++i) {
    var animation = ensemble.getAnimation(i);
    var deltaVelocity = dotprod.Vector.fromPolar(Math.random() * 2, Math.random() * 2 * Math.PI);
    var piece = new dotprod.entities.Effect(animation, this.position_, this.velocity_.add(deltaVelocity));
    this.effectIndex_.addEffect(piece);
  }

  this.energy_ = 0;
};

dotprod.entities.Player.prototype.warpFlash = function() {
  var animation = this.game_.getResourceManager().getVideoEnsemble('warp').getAnimation(0);
  this.effectIndex_.addEffect(new dotprod.entities.Effect(animation, this.position_, new dotprod.Vector(0, 0)));
};

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
 * @param {number} bounceFactor
 * @protected
 */
dotprod.entities.Player.prototype.updatePosition_ = function(bounceFactor) {
  if (!this.isAlive()) {
    return;
  }

  this.position_ = this.position_.add(this.velocity_.getXComponent());
  var collisionRect = this.game_.getMap().getCollision(this);
  if (collisionRect) {
    var xVel = this.velocity_.getX();
    this.position_ = new dotprod.Vector(xVel >= 0 ? collisionRect.left : collisionRect.right, this.position_.getY());
    this.velocity_ = new dotprod.Vector(-xVel * bounceFactor, this.velocity_.getY());
  }

  this.position_ = this.position_.add(this.velocity_.getYComponent());
  collisionRect = this.game_.getMap().getCollision(this);
  if (collisionRect) {
    var yVel = this.velocity_.getY();
    this.position_ = new dotprod.Vector(this.position_.getX(), yVel >= 0 ? collisionRect.top : collisionRect.bottom);
    this.velocity_ = new dotprod.Vector(this.velocity_.getX(), -yVel * bounceFactor);
  }
};
