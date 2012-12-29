/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Bomb');

goog.require('dotprod.Camera');
goog.require('dotprod.entities.Effect');
goog.require('dotprod.entities.Projectile');
goog.require('dotprod.model.Weapon.Type');
goog.require('dotprod.math.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Projectile}
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
dotprod.entities.Bomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  dotprod.entities.Projectile.call(this, game, owner, level, lifetime, damage, bounceCount);

  this.position_ = position;
  this.velocity_ = velocity;

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

  /**
   * @type {number}
   * @private
   */
  this.blastRadius_ = blastRadius;

  /**
   * @type {number}
   * @private
   */
  this.proxRadius_ = proxRadius;

  /**
   * @type {dotprod.entities.Player}
   * @private
   */
   this.proxActivator_;

  /**
   * @type {number}
   * @private
   */
  this.lastDistanceToProxActivator_;
};
goog.inherits(dotprod.entities.Bomb, dotprod.entities.Projectile);

/**
 * @override
 */
dotprod.entities.Bomb.prototype.getType = function() {
  return dotprod.model.Weapon.Type.BOMB;
};

/**
 * @param {!dotprod.Map} map
 * @param {!dotprod.PlayerIndex} playerIndex
 */
dotprod.entities.Bomb.prototype.update = function(map, playerIndex) {
  --this.lifetime_;
  if (!this.isAlive()) {
    return;
  }

  this.updatePosition_();

  playerIndex.some(goog.bind(this.checkPlayerCollision_, this));

  this.animation_.update();
  this.bouncingAnimation_.update();
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.Bomb.prototype.render = function(camera) {
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
 * @param {!dotprod.entities.Player} player
 */
dotprod.entities.Bomb.prototype.checkPlayerCollision_ = function(player) {
  if (!player.isAlive() || this.owner_.isFriend(player)) {
    return false;
  }

  var distance = this.position_.subtract(player.getPosition()).magnitude();
  if (player.getDimensions().boundingRect.contains(this.position_)) {
    this.explode_(player == this.game_.getPlayerIndex().getLocalPlayer());
    return true;
  } else if (!this.proxActivator_) {
    if (distance <= this.proxRadius_) {
      this.proxActivator_ = player;
      this.lastDistanceToProxActivator_ = distance;
    }
  } else if (player == this.proxActivator_) {
    if (distance > this.lastDistanceToProxActivator_) {
      this.explode_(false);
      return true;
    }
    this.lastDistanceToProxActivator_ = distance;
  }
  return false;
};

dotprod.entities.Bomb.prototype.bounce_ = function() {
  if (this.bounceCount_ == 0) {
    this.explode_(false);
  } else if (this.bounceCount_ > 0) {
    --this.bounceCount_;
  }
};

/**
 * @param {boolean} directHit True if the local player was hit directly by the bomb, false otherwise.
 */
dotprod.entities.Bomb.prototype.explode_ = function(directHit) {
  // Reset bomb state.
  this.velocity_ = new dotprod.math.Vector(0, 0);
  this.lifetime_ = 0;

  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getVideoEnsemble('explode2').getAnimation(0);
  var explosion = new dotprod.entities.Effect(animation, this.position_, new dotprod.math.Vector(0, 0));
  this.game_.getEffectIndex().addEffect(explosion);

  // Figure out how much damage the local player is going to take from this bomb explosion.
  var damageRatio;
  var player = this.game_.getPlayerIndex().getLocalPlayer();
  if (directHit) {
    damageRatio = 1;
  } else {
    var normDistance = this.position_.subtract(player.getPosition()).magnitude() / this.blastRadius_;
    damageRatio = Math.max(1 - normDistance, 0);
  }

  player.takeDamage(this.owner_, this, this.damage_ * damageRatio);
};
