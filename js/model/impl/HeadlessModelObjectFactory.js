/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.impl.HeadlessModelObjectFactory');

goog.require('dotprod.model.ModelObjectFactory');
goog.require('dotprod.entities.Bomb');
goog.require('dotprod.entities.Bullet');
goog.require('dotprod.entities.LocalPlayer');
goog.require('dotprod.entities.RemotePlayer');

/**
 * @constructor
 * @implements {dotprod.model.ModelObjectFactory}
 */
dotprod.model.impl.HeadlessModelObjectFactory = function() {};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newLocalPlayer = function(game, id, name, team, ship) {
  return new dotprod.entities.LocalPlayer(game, id, name, team, ship);
};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newRemotePlayer = function(game, id, name, team, isAlive, ship, bounty) {
  return new dotprod.entities.RemotePlayer(game, id, name, team, isAlive, ship, bounty);
};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newBullet = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  return new dotprod.entities.Bullet(game, owner, level, position, velocity, lifetime, damage, bounceCount);
};

/**
 * @override
 */
dotprod.model.impl.HeadlessModelObjectFactory.prototype.newBomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  return new dotprod.entities.Bomb(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
};
