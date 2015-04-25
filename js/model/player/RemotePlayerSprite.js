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

  /**
   * @type {!model.player.Player}
   * @protected
   */
  this.player_ = this;

  var self = this;
  this.addListener(model.player.Player.Event.DEATH, function(player, killer) {
    model.player.PlayerSprite.prototype.death_.call(player, killer);
  });

  this.addListener(model.player.Player.Event.RESPAWN, function(player) {
    model.player.PlayerSprite.prototype.respawn_.call(player);
  });

  game.getPainter().registerDrawable(graphics.Layer.PLAYERS, this);
};
goog.inherits(model.player.RemotePlayerSprite, model.player.RemotePlayer);

/**
 * @override
 */
model.player.RemotePlayerSprite.prototype.render = model.player.PlayerSprite.prototype.render;
