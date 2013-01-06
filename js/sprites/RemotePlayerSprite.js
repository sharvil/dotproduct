/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.RemotePlayerSprite');

goog.require('dotprod.model.player.RemotePlayer');
goog.require('dotprod.model.player.PlayerSprite');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @extends {dotprod.model.player.RemotePlayer}
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
goog.inherits(dotprod.sprites.RemotePlayerSprite, dotprod.model.player.RemotePlayer);

/**
 * @override
 */
dotprod.sprites.RemotePlayerSprite.prototype.respawn = dotprod.model.player.PlayerSprite.prototype.respawn;

/**
 * @override
 */
dotprod.sprites.RemotePlayerSprite.prototype.onDeath = dotprod.model.player.PlayerSprite.prototype.onDeath;

/**
 * @override
 */
dotprod.sprites.RemotePlayerSprite.prototype.render = dotprod.model.player.PlayerSprite.prototype.render;
