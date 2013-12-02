goog.provide('model.projectile.Projectile');

goog.require('model.Entity');

/**
 * @constructor
 * @extends {model.Entity}
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} level
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
model.projectile.Projectile = function(game, owner, level, lifetime, damage, bounceCount) {
  goog.base(this, game);

  /**
   * @type {!model.player.Player}
   * @protected
   */
  this.owner_ = owner;

  /**
   * @type {number}
   * @protected
   */
  this.level_ = level;

  /**
   * @type {number}
   * @protected
   */
  this.lifetime_ = lifetime;

  /**
   * @type {number}
   * @protected
   */
  this.damage_ = damage;

  /**
   * @type {number}
   * @protected
   */
  this.bounceCount_ = bounceCount;
};
goog.inherits(model.projectile.Projectile, model.Entity);

/**
 * @param {!model.player.Player} player
 * @protected
 */
model.projectile.Projectile.prototype.checkPlayerCollision_ = goog.abstractMethod;

/**
 * @param {model.player.Player} player The player who was directly hit or null if there was no direct hit.
 * @protected
 */
model.projectile.Projectile.prototype.explode_ = goog.abstractMethod;

model.projectile.Projectile.prototype.advanceTime = function() {
  if (--this.lifetime_ <= 0) {
    this.invalidate();
    return;
  }

  this.updatePosition_();
  this.game_.getPlayerIndex().some(goog.bind(this.checkPlayerCollision_, this));
};

/**
 * @override
 */
model.projectile.Projectile.prototype.bounce_ = function() {
  if (this.bounceCount_ == 0) {
    this.explode_(null);
  } else if (this.bounceCount_ > 0) {
    --this.bounceCount_;
  }
};
