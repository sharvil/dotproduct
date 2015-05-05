goog.provide('model.projectile.Decoy');

goog.require('model.projectile.Projectile');

/**
 * @constructor
 * @extends {model.projectile.Projectile}
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} angle
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {number} lifetime
 */
model.projectile.Decoy = function(game, owner, position, velocity, lifetime) {
  goog.base(this, game, owner, 0 /* level */, lifetime, 0 /* damage */, -1 /* bounceCount */);

  this.direction_ = owner.getDirection();
  this.position_ = position;
  this.velocity_ = velocity;
  this.radius_ = owner.getDimensions().radius;
};
goog.inherits(model.projectile.Decoy, model.projectile.Projectile);

/**
 * @override
 */
model.projectile.Decoy.prototype.checkPlayerCollision_ = function(player) {
  return false;
};

/**
 * @return {!model.player.Player}
 */
model.projectile.Decoy.prototype.getOwner = function() {
  return this.owner_;
};

/**
 * @return {number}
 */
model.projectile.Decoy.prototype.getDirection = function() {
  var ret = 2 * this.direction_ - this.owner_.getDirection();

  // TODO: fix this madness.
  while (ret >= 40) {
    ret -= 40;
  }
  while (ret < 0) {
    ret += 40;
  }
  return ret;
};
