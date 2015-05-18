goog.provide('model.projectile.Projectile');
goog.provide('model.projectile.Projectile.Event');

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
 * @enum {string}
 */
model.projectile.Projectile.Event = {
  EXPLODE: 'explode'
};

/**
 * Returns the level of this projectile. The values vary for each type of
 * projectile, but the weakest level is 0.
 *
 * @return {number}
 */
model.projectile.Projectile.prototype.getLevel = function() {
  return this.level_;
};

/**
 * This function returns true if the projectile is bouncy, false otherwise.
 *
 * @return {boolean}
 */
model.projectile.Projectile.prototype.isBouncing = function() {
  return this.bounceCount_ != 0;
};

/**
 * @param {!model.player.Player} player
 * @protected
 */
model.projectile.Projectile.prototype.checkPlayerCollision_ = goog.abstractMethod;

/**
 * @param {model.player.Player} player The player who was directly hit or null if there was no direct hit.
 * @protected
 */
model.projectile.Projectile.prototype.explode_ = function(player) {
  this.fireEvent_(model.projectile.Projectile.Event.EXPLODE, player);
};

model.projectile.Projectile.prototype.advanceTime = function() {
  if (--this.lifetime_ <= 0) {
    this.invalidate();
    return;
  }

  this.updatePosition_();
  this.game_.getPlayerIndex().some(this.checkPlayerCollision_.bind(this));
};

/**
 * This function is called when a repel may affect the projectile.
 *
 * @param {!model.projectile.Repel} repel
 */
model.projectile.Projectile.prototype.onRepelled = function(repel) {
  this.velocity_ = repel.apply(this.position_, this.velocity_);
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
