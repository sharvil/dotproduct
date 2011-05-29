/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Player');

goog.require('dotprod.EffectIndex');
goog.require('dotprod.FontFoundry');
goog.require('dotprod.entities.Entity');
goog.require('dotprod.Image');
goog.require('dotprod.Map');
goog.require('dotprod.Palette');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 * @param {!dotprod.Game} game
 * @param {string} name
 * @param {number} ship
 * @param {number} bounty
 */
dotprod.entities.Player = function(game, name, ship, bounty) {
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
   * @type {number}
   * @protected
   */
  this.bounty_ = bounty;

  /**
   * @type {number}
   * @protected
   */
  this.points_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.wins_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.losses_ = 0;

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
  this.bounty_ = 0;
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

/**
 * Called when this player is killed by another one.
 */
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

  ++this.losses_;
  this.bounty_ = 0;
  this.energy_ = 0;
};

/**
 * Called when this player kills another one.
 * @param {!dotprod.entities.Player} killee The player who we just killed.
 * @param {number} bountyGained How much bounty was gained by killing this player.
 */
dotprod.entities.Player.prototype.onKill = function(killee, bountyGained) {
  this.points_ += bountyGained;
  ++this.wins_;
  ++this.bounty_;
};

/**
 * Called when this player's score gets updated from the server.
 * @param {number} points
 * @param {number} wins
 * @param {number} losses
 */
dotprod.entities.Player.prototype.onScoreUpdate = function(points, wins, losses) {
  this.points_ = points;
  this.wins_ = wins;
  this.losses_ = losses;
};

/**
 * Returns true if this player is a friend (on the same team) of the other player.
 * @param {!dotprod.entities.Player} other
 * @return {boolean}
 */
dotprod.entities.Player.prototype.isFriend = function(other) {
  return this == other;
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

  var localPlayer = this.game_.getPlayerIndex().getLocalPlayer();
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles());
  var dimensions = camera.getDimensions();
  var context = camera.getContext();

  var x = Math.floor(this.position_.getX() - dimensions.left - this.image_.getTileWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.image_.getTileHeight() / 2);

  this.image_.render(context, x, y, tileNum);

  context.save();
    context.font = dotprod.FontFoundry.playerFont();
    context.fillStyle = this.isFriend(localPlayer) ? dotprod.Palette.friendColor() : dotprod.Palette.foeColor();
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(this.name_ + '(' + this.bounty_ + ')', x + this.image_.getTileWidth() / 2, y + this.image_.getTileHeight());
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
