/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.impl.GraphicalModelObjectFactory');

goog.require('dotprod.model.ModelObjectFactory');
goog.require('dotprod.model.projectile.BombSprite');
goog.require('dotprod.sprites.BulletSprite');
goog.require('dotprod.model.player.LocalPlayerSprite');
goog.require('dotprod.model.player.RemotePlayerSprite');

/**
 * @constructor
 * @implements {dotprod.model.ModelObjectFactory}
 */
dotprod.model.impl.GraphicalModelObjectFactory = function() {};

/**
 * @override
 */
dotprod.model.impl.GraphicalModelObjectFactory.prototype.newLocalPlayer = function(game, id, name, team, ship) {
  return new dotprod.model.player.LocalPlayerSprite(game, id, name, team, ship);
};

/**
 * @override
 */
dotprod.model.impl.GraphicalModelObjectFactory.prototype.newRemotePlayer = function(game, id, name, team, isAlive, ship, bounty) {
  return new dotprod.model.player.RemotePlayerSprite(game, id, name, team, isAlive, ship, bounty);
};

/**
 * @override
 */
dotprod.model.impl.GraphicalModelObjectFactory.prototype.newBullet = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  return new dotprod.sprites.BulletSprite(game, owner, level, position, velocity, lifetime, damage, bounceCount);
};

/**
 * @override
 */
dotprod.model.impl.GraphicalModelObjectFactory.prototype.newBomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  return new dotprod.model.projectile.BombSprite(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
};
