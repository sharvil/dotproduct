/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('model.impl.HeadlessModelObjectFactory');

goog.require('model.ModelObjectFactory');
goog.require('model.player.LocalPlayer');
goog.require('model.player.RemotePlayer');
goog.require('model.projectile.Bomb');
goog.require('model.projectile.Bullet');
goog.require('model.projectile.Burst');
goog.require('model.projectile.Mine');


/**
 * @constructor
 * @implements {model.ModelObjectFactory}
 */
model.impl.HeadlessModelObjectFactory = function() {};

/**
 * @override
 */
model.impl.HeadlessModelObjectFactory.prototype.newLocalPlayer = function(game, id, name, team, ship) {
  return new model.player.LocalPlayer(game, id, name, team, ship);
};

/**
 * @override
 */
model.impl.HeadlessModelObjectFactory.prototype.newRemotePlayer = function(game, id, name, team, isAlive, ship, bounty) {
  return new model.player.RemotePlayer(game, id, name, team, isAlive, ship, bounty);
};

/**
 * @override
 */
model.impl.HeadlessModelObjectFactory.prototype.newBullet = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  return new model.projectile.Bullet(game, owner, level, position, velocity, lifetime, damage, bounceCount);
};

/**
 * @override
 */
model.impl.HeadlessModelObjectFactory.prototype.newBomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  return new model.projectile.Bomb(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
};

/**
 * @override
 */
model.impl.HeadlessModelObjectFactory.prototype.newMine = function(game, owner, level, position, lifetime, damage) {
  return new model.projectile.Mine(game, owner, level, position, lifetime, damage);
};

/**
 * @override
 */
model.impl.HeadlessModelObjectFactory.prototype.newBurst = function(game, owner, shrapnelCount, position, lifetime, damage) {
  return new model.projectile.Burst(game, owner, shrapnelCount, position, lifetime, damage);
};
