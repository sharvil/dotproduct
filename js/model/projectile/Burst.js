goog.provide('model.projectile.Burst');

goog.require('Listener');
goog.require('model.projectile.Projectile');
goog.require('model.projectile.Projectile.Event');
goog.require('model.Weapon.Type');
goog.require('math.Vector');

/**
 * @constructor
 * @extends {model.projectile.Projectile}
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 */
model.projectile.Burst = function(game, owner, position, velocity, lifetime, damage) {
  goog.base(this, game, owner, 4 /* level */, lifetime, damage, -1 /* bounceCount */);

  /**
   * @type {boolean}
   * @protected
   */
  this.isActive_ = false;

  this.position_ = position;
  this.velocity_ = velocity;
};
goog.inherits(model.projectile.Burst, model.projectile.Projectile);
goog.mixin(model.projectile.Burst.prototype, Listener.prototype);

/**
 * @return {boolean} returns true if the projectile is active, false otherwise.
 */
model.projectile.Burst.prototype.isActive = function() {
  return this.isActive_;
};

/**
 * @override
 */
model.projectile.Burst.prototype.bounce_ = function() {
  goog.base(this, 'bounce_');

  this.isActive_ = true;
};

/**
 * @override
 */
model.projectile.Burst.prototype.checkPlayerCollision_ = function(player) {
  if (!player.isAlive() || this.owner_.isFriend(player) || !this.isActive_) {
    return false;
  }

  if (player.getDimensions().boundingRect.contains(this.position_)) {
    this.explode_(player);
    return true;
  }
  return false;
};

/**
 * @override
 */
model.projectile.Burst.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  this.lifetime_ = 0;

  if (hitPlayer) {
    hitPlayer.onDamage(this.owner_, this, this.damage_);
  }
};
