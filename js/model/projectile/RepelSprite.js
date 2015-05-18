goog.provide('model.projectile.RepelSprite');

goog.require('model.ModelObject');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @implements {graphics.Drawable}
 * @param {!ui.Game} game
 * @param {!model.projectile.Repel} repel
 */
model.projectile.RepelSprite = function(game, repel) {
  goog.base(this, game.getSimulation());

  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!model.projectile.Repel}
   * @private
   */
  this.repel_ = repel;

  /**
   * @type {!model.projectile.Repel}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('repel').getAnimation(0);

  game.getPainter().registerDrawable(graphics.Layer.EFFECTS, this);
};
goog.inherits(model.projectile.RepelSprite, model.ModelObject);

model.projectile.RepelSprite.prototype.advanceTime = function() {
  this.animation_.update();
  if (!this.animation_.isRunning()) {
    this.invalidate();
  }
};

model.projectile.RepelSprite.prototype.render = function(viewport) {
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.repel_.getPosition().getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.repel_.getPosition().getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(viewport.getContext(), x, y);
};

/**
 * @override
 */
model.projectile.RepelSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.EFFECTS, this);
};
