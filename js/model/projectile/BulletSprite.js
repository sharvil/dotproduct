goog.provide('model.projectile.BulletSprite');

goog.require('math.Vector');
goog.require('model.Effect');
goog.require('model.projectile.Projectile.Event');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.projectile.Bullet} bullet
 */
model.projectile.BulletSprite = function(game, bullet) {
  goog.base(this, game.getSimulation());

  var level = bullet.getLevel();

  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!model.projectile.Bullet}
   * @private
   */
  this.bullet_ = bullet;

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.bouncingAnimation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(5 + level);
  this.bouncingAnimation_.setRepeatCount(-1);

  this.bullet_.addListener(model.projectile.Projectile.Event.EXPLODE, this.onExplode_.bind(this));

  game.getPainter().registerDrawable(graphics.Layer.PROJECTILES, this);
};
goog.inherits(model.projectile.BulletSprite, model.ModelObject);

/**
 * @override
 */
model.projectile.BulletSprite.prototype.advanceTime = function() {
  this.animation_.update();
  this.bouncingAnimation_.update();
};

/**
 * @override
 */
model.projectile.BulletSprite.prototype.render = function(viewport) {
  if (!this.bullet_.isValid()) {
    this.invalidate();
    return;
  }

  if (Labs.BULLET_TRAILS) {
    var animation = this.game_.getResourceManager().getSpriteSheet('bulletTrails').getAnimation(3 + this.bullet_.getLevel());
    new model.Effect(this.game_, animation, this.bullet_.getPosition(), math.Vector.ZERO, graphics.Layer.TRAILS);
  }

  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.bullet_.getPosition().getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.bullet_.getPosition().getY() - dimensions.top - this.animation_.getHeight() / 2);
  var animation = this.bullet_.isBouncing() ? this.bouncingAnimation_ : this.animation_;

  animation.render(viewport.getContext(), x, y);
};

/**
 * This function gets called when a bullet explodes and hits a player.
 *
 * @param {!model.projectile.Projectile} projectile
 * @param {!model.player.Player} hitPlayer
 */
model.projectile.BulletSprite.prototype.onExplode_ = function(projectile, hitPlayer) {
  var animation = this.game_.getResourceManager().getSpriteSheet('explode0').getAnimation(0);
  new model.Effect(this.game_, animation, this.bullet_.getPosition(), math.Vector.ZERO);
};

/**
 * @override
 */
model.projectile.BulletSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.PROJECTILES, this);
};
