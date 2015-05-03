goog.provide('model.projectile.BulletGroup');

/**
 * @constructor
 * @param {!Array.<!model.projectile.Bullet>} bullets
 */
model.projectile.BulletGroup = function(bullets) {
  // If there aren't at least two bullets, don't bother grouping.
  if (bullets.length < 2) {
    return;
  }

  /**
   * @type {!Array.<!model.projectile.Bullet>}
   * @private
   */
  this.bullets_ = bullets;

  for (var i = 0; i < this.bullets_.length; ++i) {
    this.bullets_[i].addListener(model.projectile.Projectile.Event.EXPLODE, this.onExplode_.bind(this));
  }
};

/**
 * @param {!model.projectile.Bullet} bullet
 * @param {!model.player.Player} player
 */
model.projectile.BulletGroup.prototype.onExplode_ = function(bullet, player) {
  // Only explode other bullets in the group if a bullet is exploding due to
  // a direct hit on a player.
  if (!player) {
    return;
  }

  // Notify all other bullets in the group that they should explode. The
  // original bullet will have a direct hit specified but all other bullets are
  // exploding because they're linked, not because they directly hit a player.
  for (var i = 0; i < this.bullets_.length; ++i) {
    if (this.bullets_[i] != bullet) {
      this.bullets_[i].explode_(null);
    }
  }
};
