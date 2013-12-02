goog.provide('model.projectile.BombSprite');

goog.require('Labs');
goog.require('model.projectile.Bomb');
goog.require('model.Effect');
goog.require('math.Vector');
goog.require('graphics.Drawable');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.projectile.Bomb}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} level
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 * @param {number} blastRadius
 * @param {number} proxRadius
 */
model.projectile.BombSprite = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  goog.base(this, game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('bombs').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.bouncingAnimation_ = game.getResourceManager().getSpriteSheet('bombs').getAnimation(level + 8);
  this.bouncingAnimation_.setRepeatCount(-1);

  /**
   * @type {number}
   * @private
   */
  this.trailTimer_ = 0;

  game.getPainter().registerDrawable(graphics.Layer.PROJECTILES, this);
};
goog.inherits(model.projectile.BombSprite, model.projectile.Bomb);

/**
 * @override
 */
model.projectile.BombSprite.prototype.advanceTime = function() {
  // First advance and drop the trail.
  if (Labs.BOMB_TRAILS && ++this.trailTimer_ == 2) {
    var animation = this.game_.getResourceManager().getSpriteSheet('bombTrails').getAnimation(this.level_);
    var trail = new model.Effect(this.game_, animation, this.position_, new math.Vector(0, 0), graphics.Layer.TRAILS);
    this.trailTimer_ = 0;
  }

  // Then advance the bomb itself.
  goog.base(this, 'advanceTime');
  this.animation_.update();
  this.bouncingAnimation_.update();
};

/**
 * @override
 */
model.projectile.BombSprite.prototype.render = function(viewport) {
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  if(this.bounceCount_) {
    this.bouncingAnimation_.render(viewport.getContext(), x, y);
  } else {
    this.animation_.render(viewport.getContext(), x, y);
  }
};

/**
 * @override
 */
model.projectile.BombSprite.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getSpriteSheet('explode2').getAnimation(0);
  var explosion = new model.Effect(this.game_, animation, this.position_, new math.Vector(0, 0));
};

/**
 * @override
 */
model.projectile.BombSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.PROJECTILES, this);
};
