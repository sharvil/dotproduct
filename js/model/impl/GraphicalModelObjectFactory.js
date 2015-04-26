goog.provide('model.impl.GraphicalModelObjectFactory');

goog.require('model.ModelObjectFactory');
goog.require('model.player.LocalPlayerSprite');
goog.require('model.player.RemotePlayerSprite');
goog.require('model.projectile.BombSprite');
goog.require('model.projectile.BulletSprite');
goog.require('model.projectile.BurstSprite');
goog.require('model.projectile.MineSprite');

/**
 * @constructor
 * @implements {model.ModelObjectFactory}
 */
model.impl.GraphicalModelObjectFactory = function() {};

/**
 * @override
 */
model.impl.GraphicalModelObjectFactory.prototype.newLocalPlayer = function(game, id, name, team, ship) {
  var player = new model.player.LocalPlayer(game, id, name, team, ship);
  var sprite = new model.player.LocalPlayerSprite(game, player);

  return player;
};

/**
 * @override
 */
model.impl.GraphicalModelObjectFactory.prototype.newRemotePlayer = function(game, id, name, team, isAlive, ship, bounty) {
  var player = new model.player.RemotePlayer(game, id, name, team, isAlive, ship, bounty);
  var sprite = new model.player.RemotePlayerSprite(game, player);

  return player;
};

/**
 * @override
 */
model.impl.GraphicalModelObjectFactory.prototype.newBullet = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  return new model.projectile.BulletSprite(game, owner, level, position, velocity, lifetime, damage, bounceCount);
};

/**
 * @override
 */
model.impl.GraphicalModelObjectFactory.prototype.newBomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  return new model.projectile.BombSprite(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
};

/**
 * @override
 */
model.impl.GraphicalModelObjectFactory.prototype.newMine = function(game, owner, level, position, lifetime, damage) {
  return new model.projectile.MineSprite(game, owner, level, position, lifetime, damage);
};

/**
 * @override
 */
model.impl.GraphicalModelObjectFactory.prototype.newBurst = function(game, owner, shrapnelCount, position, lifetime, damage) {
  return new model.projectile.BurstSprite(game, owner, shrapnelCount, position, lifetime, damage);
};
