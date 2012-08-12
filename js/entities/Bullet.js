/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Bullet');

goog.require('dotprod.Camera');
goog.require('dotprod.entities.Effect');
goog.require('dotprod.entities.Projectile');
goog.require('dotprod.model.Weapon.Type');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Projectile}
 * @param {!dotprod.Game} game
 * @param {!dotprod.entities.Player} owner
 * @param {number} level
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
dotprod.entities.Bullet = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  dotprod.entities.Projectile.call(this, game, owner, level, lifetime, damage, bounceCount);

  this.position_ = position;
  this.velocity_ = velocity;

  /**
   * @type {!dotprod.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getVideoEnsemble('bullets').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {!dotprod.Animation}
   * @private
   */
   this.bouncingAnimation_ = game.getResourceManager().getVideoEnsemble('bullets').getAnimation(5 + level);
   this.bouncingAnimation_.setRepeatCount(-1);
};
goog.inherits(dotprod.entities.Bullet, dotprod.entities.Projectile);

/**
 * @override
 */
dotprod.entities.Bullet.prototype.getType = function() {
  return dotprod.model.Weapon.Type.BULLET;
};

/**
 * @param {!dotprod.Map} map
 * @param {!dotprod.PlayerIndex} playerIndex
 */
dotprod.entities.Bullet.prototype.update = function(map, playerIndex) {
  --this.lifetime_;
  if (!this.isAlive()) {
    return;
  }

  this.updatePosition_();

  var players = playerIndex.getPlayers();
  for (var i = 0; i < players.length; ++i) {
    if (this.checkPlayerCollision_(players[i])) {
      break;
    }
  }

  this.animation_.update();
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.Bullet.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

  var dimensions = camera.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);
  var animation = this.bounceCount_ ? this.bouncingAnimation_ : this.animation_;

  animation.render(camera.getContext(), x, y);
};

/**
 * @param {!dotprod.entities.Player} player
 */
dotprod.entities.Bullet.prototype.checkPlayerCollision_ = function(player) {
  if (!player.isAlive() || this.owner_ == player) {
    return false;
  }

  var dimensions = player.getDimensions();
  var x = this.position_.getX();
  var y = this.position_.getY();
  if (x >= dimensions.left && x <= dimensions.right && y >= dimensions.top && y <= dimensions.bottom) {
    player.takeDamage(this.owner_, this, this.damage_);
    this.lifetime_ = 0;
    this.explode_();
    return true;
  }
  return false;
};

dotprod.entities.Bullet.prototype.bounce_ = function() {
  if (this.bounceCount_ == 0) {
    this.velocity_ = new dotprod.Vector(0, 0);
    this.lifetime_ = 0;
    this.explode_();
  } else if (this.bounceCount_ > 0) {
    --this.bounceCount_;
  }
};

dotprod.entities.Bullet.prototype.explode_ = function() {
  var animation = this.game_.getResourceManager().getVideoEnsemble('explode0').getAnimation(0);
  var explosion = new dotprod.entities.Effect(animation, this.position_, new dotprod.Vector(0, 0));
  this.game_.getEffectIndex().addEffect(explosion);
};
