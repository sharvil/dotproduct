/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.RemotePlayerSprite');

goog.require('dotprod.entities.RemotePlayer');
goog.require('dotprod.sprites.PlayerSprite');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @extends {dotprod.entities.RemotePlayer}
 * @implements {dotprod.sprites.Sprite}
 * @param {!dotprod.Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {boolean} isAlive
 * @param {number} ship
 * @param {number} bounty
 */
dotprod.sprites.RemotePlayerSprite = function(game, id, name, team, isAlive, ship, bounty) {
  goog.base(this, game, id, name, team, isAlive, ship, bounty);
};
goog.inherits(dotprod.sprites.RemotePlayerSprite, dotprod.entities.RemotePlayer);

/**
 * @override
 */
dotprod.sprites.RemotePlayerSprite.prototype.respawn = dotprod.sprites.PlayerSprite.prototype.respawn;

/**
 * @override
 */
dotprod.sprites.RemotePlayerSprite.prototype.onDeath = dotprod.sprites.PlayerSprite.prototype.onDeath;

/**
 * @override
 */
dotprod.sprites.RemotePlayerSprite.prototype.render = dotprod.sprites.PlayerSprite.prototype.render;
