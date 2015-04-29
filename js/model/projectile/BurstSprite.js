goog.provide('model.projectile.BurstSprite');

goog.require('math.Vector');
goog.require('model.Effect');
goog.require('model.projectile.Projectile.Event');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.projectile.Burst} burst
 */
model.projectile.BurstSprite = function(game, burst) {
  goog.base(this, game.getSimulation());

  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!model.projectile.Burst}
   * @private
   */
  this.burst_ = burst;

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.activeAnimation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(9);
  this.activeAnimation_.setRepeatCount(-1);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.inactiveAnimation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(4);
  this.inactiveAnimation_.setRepeatCount(-1);

  this.burst_.addListener(model.projectile.Projectile.Event.EXPLODE, this.onExplode_.bind(this));

  game.getPainter().registerDrawable(graphics.Layer.PROJECTILES, this);
};
goog.inherits(model.projectile.BurstSprite, model.ModelObject);

/**
 * @override
 */
model.projectile.BurstSprite.prototype.advanceTime = function() {
  this.activeAnimation_.update();
  this.inactiveAnimation_.update();
};

/**
 * @override
 */
model.projectile.BurstSprite.prototype.render = function(viewport) {
  if (!this.burst_.isValid()) {
    this.invalidate();
    return;
  }

  var animation = this.burst_.isActive() ? this.activeAnimation_ : this.inactiveAnimation_;
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.burst_.getPosition().getX() - dimensions.left - animation.getWidth() / 2);
  var y = Math.floor(this.burst_.getPosition().getY() - dimensions.top - animation.getHeight() / 2);

  animation.render(viewport.getContext(), x, y);
};

/**
 * This function gets called when a burst bullet explodes and hits a player.
 *
 * @param {!model.projectile.Projectile} projectile
 * @param {!model.player.Player} hitPlayer
 */
model.projectile.BurstSprite.prototype.onExplode_ = function(projectile, hitPlayer) {
  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getSpriteSheet('explode0').getAnimation(0);
  new model.Effect(this.game_, animation, this.burst_.getPosition(), math.Vector.ZERO);
};

/**
 * @override
 */
model.projectile.BurstSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.PROJECTILES, this);
};
