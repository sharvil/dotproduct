goog.provide('model.projectile.MineSprite');

goog.require('math.Vector');
goog.require('model.projectile.Mine');
goog.require('model.Effect');
goog.require('graphics.Drawable');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.projectile.Mine}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} level
 * @param {!math.Vector} position
 * @param {number} lifetime
 * @param {number} damage
 */
model.projectile.MineSprite = function(game, owner, level, position, lifetime, damage) {
  goog.base(this, game, owner, level, position, lifetime, damage);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('mines').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  game.getPainter().registerDrawable(graphics.Layer.PROJECTILES, this);
};
goog.inherits(model.projectile.MineSprite, model.projectile.Mine);

/**
 * @override
 */
model.projectile.MineSprite.prototype.advanceTime = function() {
  goog.base(this, 'advanceTime');
  this.animation_.update();
};

/**
 * @override
 */
model.projectile.MineSprite.prototype.render = function(viewport) {
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(viewport.getContext(), x, y);
};

/**
 * @override
 */
model.projectile.MineSprite.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getSpriteSheet('explode2').getAnimation(0);
  var explosion = new model.Effect(this.game_, animation, this.position_, math.Vector.ZERO);
};

/**
 * @override
 */
model.projectile.MineSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.PROJECTILES, this);
};
