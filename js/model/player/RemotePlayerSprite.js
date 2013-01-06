/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.player.RemotePlayerSprite');

goog.require('dotprod.model.player.RemotePlayer');
goog.require('dotprod.model.player.PlayerSprite');
goog.require('dotprod.Drawable');

/**
 * @constructor
 * @extends {dotprod.model.player.RemotePlayer}
 * @implements {dotprod.Drawable}
 * @param {!dotprod.Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {boolean} isAlive
 * @param {number} ship
 * @param {number} bounty
 */
dotprod.model.player.RemotePlayerSprite = function(game, id, name, team, isAlive, ship, bounty) {
  goog.base(this, game, id, name, team, isAlive, ship, bounty);
};
goog.inherits(dotprod.model.player.RemotePlayerSprite, dotprod.model.player.RemotePlayer);

/**
 * @override
 */
dotprod.model.player.RemotePlayerSprite.prototype.respawn = dotprod.model.player.PlayerSprite.prototype.respawn;

/**
 * @override
 */
dotprod.model.player.RemotePlayerSprite.prototype.onDeath = dotprod.model.player.PlayerSprite.prototype.onDeath;

/**
 * @override
 */
dotprod.model.player.RemotePlayerSprite.prototype.render = dotprod.model.player.PlayerSprite.prototype.render;
