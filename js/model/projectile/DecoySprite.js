goog.provide('model.projectile.DecoySprite');

goog.require('model.player.PlayerSprite');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.projectile.Decoy} decoy
 */
model.projectile.DecoySprite = function(game, decoy) {
  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!model.projectile.Decoy}
   * @private
   */
  this.decoy_ = decoy;

  game.getPainter().registerDrawable(graphics.Layer.PROJECTILES, this);
};

/**
 * @override
 */
model.projectile.DecoySprite.prototype.render = function(viewport) {
  if (!this.decoy_.isValid()) {
    this.game_.getPainter().unregisterDrawable(graphics.Layer.PROJECTILES, this);
    return;
  }

  model.player.PlayerSprite.renderPlayer(this.game_, viewport, this.decoy_.getOwner(), this.decoy_.getDirection(), this.decoy_.getPosition());
};
