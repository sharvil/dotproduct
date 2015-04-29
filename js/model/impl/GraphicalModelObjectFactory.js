goog.provide('model.impl.GraphicalModelObjectFactory');

goog.require('model.ModelObjectFactory');
goog.require('model.player.LocalPlayer');
goog.require('model.player.LocalPlayerSprite');
goog.require('model.player.RemotePlayer');
goog.require('model.player.RemotePlayerSprite');
goog.require('model.projectile.Bomb');
goog.require('model.projectile.BombSprite');
goog.require('model.projectile.Bullet');
goog.require('model.projectile.BulletSprite');
goog.require('model.projectile.Burst');
goog.require('model.projectile.BurstSprite');
goog.require('model.projectile.Mine');
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
  var projectile = new model.projectile.Bullet(game, owner, level, position, velocity, lifetime, damage, bounceCount);
  var sprite = new model.projectile.BulletSprite(game, projectile);

  return projectile;
};

/**
 * @override
 */
model.impl.GraphicalModelObjectFactory.prototype.newBomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  var projectile = new model.projectile.Bomb(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
  var sprite = new model.projectile.BombSprite(game, projectile);

  return projectile;
};

/**
 * @override
 */
model.impl.GraphicalModelObjectFactory.prototype.newMine = function(game, owner, level, position, lifetime, damage) {
  var projectile = new model.projectile.Mine(game, owner, level, position, lifetime, damage);
  var sprite = new model.projectile.MineSprite(game, projectile);

  return projectile;
};

/**
 * @override
 */
model.impl.GraphicalModelObjectFactory.prototype.newBurst = function(game, owner, shrapnelCount, position, lifetime, damage) {
  var projectile = new model.projectile.Burst(game, owner, shrapnelCount, position, lifetime, damage);
  var sprite = new model.projectile.BurstSprite(game, projectile);

  return projectile;
};
