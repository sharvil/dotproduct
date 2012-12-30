/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.BombSprite');

goog.require('dotprod.entities.Bomb');
goog.require('dotprod.entities.Effect');
goog.require('dotprod.math.Vector');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @extends {dotprod.entities.Bomb}
 * @implements {dotprod.sprites.Sprite}
 * @param {!dotprod.Game} game
 * @param {!dotprod.entities.Player} owner
 * @param {number} level
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 * @param {number} blastRadius
 * @param {number} proxRadius
 */
dotprod.sprites.BombSprite = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  goog.base(this, game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);

  /**
   * @type {!dotprod.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getVideoEnsemble('bombs').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {!dotprod.Animation}
   * @private
   */
  this.bouncingAnimation_ = game.getResourceManager().getVideoEnsemble('bombs').getAnimation(level + 8);
  this.bouncingAnimation_.setRepeatCount(-1);
};
goog.inherits(dotprod.sprites.BombSprite, dotprod.entities.Bomb);

/**
 * @override
 */
dotprod.sprites.BombSprite.prototype.update = function(map, playerIndex) {
  goog.base(this, 'update', map, playerIndex);
  this.animation_.update();
  this.bouncingAnimation_.update();
};

/**
 * @override
 */
dotprod.sprites.BombSprite.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

  var dimensions = camera.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  if(this.bounceCount_) {
    this.bouncingAnimation_.render(camera.getContext(), x, y);
  } else {
    this.animation_.render(camera.getContext(), x, y);
  }
};

/**
 * @override
 */
dotprod.sprites.BombSprite.prototype.explode_ = function(directHit) {
  goog.base(this, 'explode_', directHit);

  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getVideoEnsemble('explode2').getAnimation(0);
  var explosion = new dotprod.entities.Effect(animation, this.position_, new dotprod.math.Vector(0, 0));
  this.game_.getEffectIndex().addEffect(explosion);
};
