/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('model.player.RemotePlayerSprite');

goog.require('model.player.RemotePlayer');
goog.require('model.player.PlayerSprite');
goog.require('graphics.Drawable');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.player.RemotePlayer}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {boolean} isAlive
 * @param {number} ship
 * @param {number} bounty
 */
model.player.RemotePlayerSprite = function(game, id, name, team, isAlive, ship, bounty) {
  goog.base(this, game, id, name, team, isAlive, ship, bounty);

  game.getPainter().registerDrawable(graphics.Layer.PLAYERS, this);
};
goog.inherits(model.player.RemotePlayerSprite, model.player.RemotePlayer);

/**
 * @override
 */
model.player.RemotePlayerSprite.prototype.respawn = model.player.PlayerSprite.prototype.respawn;

/**
 * @override
 */
model.player.RemotePlayerSprite.prototype.onDeath = model.player.PlayerSprite.prototype.onDeath;

/**
 * @override
 */
model.player.RemotePlayerSprite.prototype.render = model.player.PlayerSprite.prototype.render;

/**
 * @override
 */
model.player.RemotePlayerSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.PLAYERS, this);
};
