goog.provide('model.impl.HeadlessModelObjectFactory');

goog.require('model.ModelObjectFactory');
goog.require('model.player.LocalPlayer');
goog.require('model.player.RemotePlayer');
goog.require('model.projectile.Bomb');
goog.require('model.projectile.Bullet');
goog.require('model.projectile.Burst');
goog.require('model.projectile.Decoy');

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
model.impl.HeadlessModelObjectFactory.prototype.newBurst = function(game, owner, position, velocity, lifetime, damage) {
  return new model.projectile.Burst(game, owner, position, velocity, lifetime, damage);
};

/**
 * @override
 */
model.impl.HeadlessModelObjectFactory.prototype.newDecoy = function(game, owner, position, velocity, lifetime) {
  return new model.projectile.Decoy(game, owner, position, velocity, lifetime);
};
