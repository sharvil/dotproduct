goog.provide('model.projectile.Mine');

goog.require('model.projectile.Projectile');
goog.require('model.Weapon.Type');
goog.require('math.Vector');

/**
 * @constructor
 * @extends {model.projectile.Projectile}
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} level
 * @param {!math.Vector} position
 * @param {number} lifetime
 * @param {number} damage
 */
model.projectile.Mine = function(game, owner, level, position, lifetime, damage) {
  goog.base(this, game, owner, level, lifetime, damage, 0);

  this.position_ = position;
};
goog.inherits(model.projectile.Mine, model.projectile.Projectile);

/**
 * @override
 */
model.projectile.Mine.prototype.checkPlayerCollision_ = function(player) {
  if (!player.isAlive() || this.owner_.isFriend(player)) {
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
model.projectile.Mine.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  this.lifetime_ = 0;

  if (hitPlayer) {
    hitPlayer.onDamage(this.owner_, this, this.damage_);
  }
};
