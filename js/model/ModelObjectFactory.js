/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('model.ModelObjectFactory');

/**
 * @interface
 */
model.ModelObjectFactory = goog.nullFunction;

/**
 * @param {!Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {number} ship
 * @return {!model.player.LocalPlayer}
 */
model.ModelObjectFactory.prototype.newLocalPlayer = goog.abstractMethod;

/**
 * @param {!Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {boolean} isAlive
 * @param {number} ship
 * @param {number} bounty
 * @return {!model.player.RemotePlayer}
 */
model.ModelObjectFactory.prototype.newRemotePlayer = goog.abstractMethod;

/**
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} level
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 * @return {!model.projectile.Bullet}
 */
model.ModelObjectFactory.prototype.newBullet = goog.abstractMethod;

/**
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} level
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 * @param {number} blastRadius
 * @param {number} proxRadius
 * @return {!model.projectile.Bomb}
 */
model.ModelObjectFactory.prototype.newBomb = goog.abstractMethod;

/**
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} level
 * @param {!math.Vector} position
 * @param {number} lifetime
 * @param {number} damage
 * @return {!model.projectile.Mine}
 */
model.ModelObjectFactory.prototype.newMine = goog.abstractMethod;

/**
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @return {!model.projectile.Burst}
 */
model.ModelObjectFactory.prototype.newBurst = goog.abstractMethod;
