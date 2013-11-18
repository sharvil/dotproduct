/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.impl.HeadlessModelObjectFactory');

goog.require('dotprod.model.ModelObjectFactory');
goog.require('dotprod.model.player.LocalPlayer');
goog.require('dotprod.model.player.RemotePlayer');
goog.require('dotprod.model.projectile.Bomb');
goog.require('dotprod.model.projectile.Bullet');
goog.require('dotprod.model.projectile.Burst');
goog.require('dotprod.model.projectile.Mine');


/**
 * @constructor
 * @implements {dotprod.model.ModelObjectFactory}
 */
dotprod.model.impl.HeadlessModelObjectFactory = function() {};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newLocalPlayer = function(game, id, name, team, ship) {
  return new dotprod.model.player.LocalPlayer(game, id, name, team, ship);
};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newRemotePlayer = function(game, id, name, team, isAlive, ship, bounty) {
  return new dotprod.model.player.RemotePlayer(game, id, name, team, isAlive, ship, bounty);
};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newBullet = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  return new dotprod.model.projectile.Bullet(game, owner, level, position, velocity, lifetime, damage, bounceCount);
};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newBomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  return new dotprod.model.projectile.Bomb(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newMine = function(game, owner, level, position, lifetime, damage) {
  return new dotprod.model.projectile.Mine(game, owner, level, position, lifetime, damage);
};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newBurst = function(game, owner, shrapnelCount, position, lifetime, damage) {
  return new dotprod.model.projectile.Burst(game, owner, shrapnelCount, position, lifetime, damage);
};
