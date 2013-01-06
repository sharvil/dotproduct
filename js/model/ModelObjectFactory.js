/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.ModelObjectFactory');

/**
 * @interface
 */
dotprod.model.ModelObjectFactory = goog.nullFunction;

/**
 * @param {!dotprod.Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {number} ship
 * @return {!dotprod.model.player.LocalPlayer}
 */
dotprod.model.ModelObjectFactory.prototype.newLocalPlayer = goog.abstractMethod;

/**
 * @param {!dotprod.Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {boolean} isAlive
 * @param {number} ship
 * @param {number} bounty
 * @return {!dotprod.entities.RemotePlayer}
 */
dotprod.model.ModelObjectFactory.prototype.newRemotePlayer = goog.abstractMethod;

/**
 * @param {!dotprod.Game} game
 * @param {!dotprod.model.player.Player} owner
 * @param {number} level
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 * @return {!dotprod.entities.Bullet}
 */
dotprod.model.ModelObjectFactory.prototype.newBullet = goog.abstractMethod;

/**
 * @param {!dotprod.Game} game
 * @param {!dotprod.model.player.Player} owner
 * @param {number} level
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 * @param {number} blastRadius
 * @param {number} proxRadius
 * @return {!dotprod.entities.Bomb}
 */
dotprod.model.ModelObjectFactory.prototype.newBomb = goog.abstractMethod;
