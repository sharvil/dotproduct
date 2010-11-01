/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Projectile');

goog.require('goog.asserts');
goog.require('dotprod.entities.Entity');
goog.require('dotprod.entities.Player');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 * @param {!dotprod.Game} game
 * @param {!dotprod.entities.Player} owner
 * @param {number} lifetime
 * @param {number} damage
 */
dotprod.entities.Projectile = function(game, owner, lifetime, damage) {
  dotprod.entities.Entity.call(this);

  /**
   * @type {!dotprod.Game}
   * @protected
   */
  this.game_ = game;

  /**
   * @type {!dotprod.entities.Player}
   * @protected
   */
  this.owner_ = owner;

  /**
   * @type {number}
   * @protected
   */
  this.lifetime_ = lifetime;

  /**
   * @type {number}
   * @protected
   */
  this.damage_ = damage;
};
goog.inherits(dotprod.entities.Projectile, dotprod.entities.Entity);

/**
 * @return {boolean}
 */
dotprod.entities.Projectile.prototype.isAlive = function() {
  return this.lifetime_ >= 0;
};

dotprod.entities.Projectile.prototype.getType = function() {
  if (this instanceof dotprod.entities.Bullet) {
    return 1;
  } else if (this instanceof dotprod.entities.Bomb) {
    return 2;
  } else {
    goog.asserts.assert(false, 'Requesting type of unknown projectile.');
  }
};

dotprod.entities.Projectile.deserialize = function(game, owner, type, position, velocity) {
  switch (type) {
    case 1:
      return new dotprod.entities.Bullet(game, owner, position, velocity);
    case 2:
      return new dotprod.entities.Bomb(game, owner, position, velocity);
    default:
      goog.asserts.assert(false, 'Unhandled projectile type in deserialize: ' + type);
  }
};
