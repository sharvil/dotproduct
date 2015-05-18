goog.provide('model.projectile.Repel');

goog.require('model.projectile.Projectile');

/**
 * @constructor
 * @extends {model.projectile.Projectile}
 * @param {!ui.Game} game
 * @param {!model.player.Player} owner
 * @param {!math.Vector} position
 * @param {number} lifetime
 * @param {number} distance
 * @param {number} speed
 */
model.projectile.Repel = function(game, owner, position, lifetime, distance, speed) {
  goog.base(this, game, owner, 0 /* level */, lifetime, 0, 0 /* bounceCount */);

  /**
   * @type {number}
   * @private
   */
  this.distance_ = distance;

  /**
   * @type {number}
   * @private
   */
  this.speed_ = speed;

  this.position_ = position;
};
goog.inherits(model.projectile.Repel, model.projectile.Projectile);

/**
 * Given the position and velocity of an entity, this function returns the new
 * velocity the entity should have after being repelled.
 *
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @return {!math.Vector}
 */
model.projectile.Repel.prototype.apply = function(position, velocity) {
  var delta = position.subtract(this.position_);
  if (delta.magnitude() <= this.distance_) {
    velocity = delta.resize(this.speed_);
  }
  return velocity;
}

/**
 * @override
 */
model.projectile.Repel.prototype.advanceTime = function() {
  var self = this;

  this.game_.getPlayerIndex().forEach(function(player) {
    if (!self.owner_.isFriend(player)) {
      player.onRepelled(self);
    }
  });

  goog.base(this, 'advanceTime');
};

/**
 * @override
 */
model.projectile.Repel.prototype.onRepelled = function(repel) {
  // Can't repel a repel.
  return false;
};

/**
 * @override
 */
model.projectile.Repel.prototype.checkPlayerCollision_ = function(player) {
  return false;
};
