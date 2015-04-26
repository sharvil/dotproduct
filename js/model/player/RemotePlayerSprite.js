goog.provide('model.player.RemotePlayerSprite');

goog.require('graphics.Layer');
goog.require('model.player.PlayerSprite');

/**
 * @constructor
 * @extends {model.player.PlayerSprite}
 * @param {!Game} game
 * @param {!model.player.Player} player
 */
model.player.RemotePlayerSprite = function(game, player) {
  goog.base(this, game, player, graphics.Layer.PLAYERS);
};
goog.inherits(model.player.RemotePlayerSprite, model.player.PlayerSprite);
