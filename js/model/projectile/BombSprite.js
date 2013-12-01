/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.projectile.BombSprite');

goog.require('dotprod.Labs');
goog.require('dotprod.model.projectile.Bomb');
goog.require('dotprod.model.Effect');
goog.require('dotprod.math.Vector');
goog.require('dotprod.graphics.Drawable');
goog.require('dotprod.graphics.Layer');

/**
 * @constructor
 * @extends {dotprod.model.projectile.Bomb}
 * @implements {dotprod.graphics.Drawable}
 * @param {!dotprod.Game} game
 * @param {!dotprod.model.player.Player} owner
 * @param {number} level
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 * @param {number} blastRadius
 * @param {number} proxRadius
 */
dotprod.model.projectile.BombSprite = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  goog.base(this, game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);

  /**
   * @type {!dotprod.graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('bombs').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {!dotprod.graphics.Animation}
   * @private
   */
  this.bouncingAnimation_ = game.getResourceManager().getSpriteSheet('bombs').getAnimation(level + 8);
  this.bouncingAnimation_.setRepeatCount(-1);

  /**
   * @type {number}
   * @private
   */
  this.trailTimer_ = 0;

  game.getPainter().registerDrawable(dotprod.graphics.Layer.PROJECTILES, this);
};
goog.inherits(dotprod.model.projectile.BombSprite, dotprod.model.projectile.Bomb);

/**
 * @override
 */
dotprod.model.projectile.BombSprite.prototype.advanceTime = function() {
  // First advance and drop the trail.
  if (dotprod.Labs.BOMB_TRAILS && ++this.trailTimer_ == 2) {
    var animation = this.game_.getResourceManager().getSpriteSheet('bombTrails').getAnimation(this.level_);
    var trail = new dotprod.model.Effect(this.game_, animation, this.position_, new dotprod.math.Vector(0, 0), dotprod.graphics.Layer.TRAILS);
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
dotprod.model.projectile.BombSprite.prototype.render = function(viewport) {
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
dotprod.model.projectile.BombSprite.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getSpriteSheet('explode2').getAnimation(0);
  var explosion = new dotprod.model.Effect(this.game_, animation, this.position_, new dotprod.math.Vector(0, 0));
};

/**
 * @override
 */
dotprod.model.projectile.BombSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(dotprod.graphics.Layer.PROJECTILES, this);
};
