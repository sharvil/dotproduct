/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Bullet');

goog.require('dotprod.Camera');
goog.require('dotprod.EffectIndex');
goog.require('dotprod.entities.Effect');
goog.require('dotprod.entities.Player');
goog.require('dotprod.entities.Projectile');
goog.require('dotprod.Map');
goog.require('dotprod.PlayerIndex');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Projectile}
 * @param {!dotprod.Game} game
 * @param {!dotprod.entities.Player} owner
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 */
dotprod.entities.Bullet = function(game, owner, position, velocity) {
  var bulletSettings = game.getSettings()['ships'][owner.getShip()]['bullet'];

  dotprod.entities.Projectile.call(this, game, owner, bulletSettings['lifetime'], bulletSettings['damage']);

  /**
   * @type {string}
   * @private
   */
  this.color_ = bulletSettings['color'];

  this.position_ = position;
  this.velocity_ = velocity;
};
goog.inherits(dotprod.entities.Bullet, dotprod.entities.Projectile);

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.entities.Bullet.RADIUS_ = 5;

/**
 * @param {!dotprod.Map} map
 * @param {!dotprod.PlayerIndex} playerIndex
 */
dotprod.entities.Bullet.prototype.update = function(map, playerIndex) {
  --this.lifetime_;
  if (!this.isAlive()) {
    return;
  }

  this.position_ = this.position_.add(this.velocity_.getXComponent());
  var collision = map.getCollision(this);
  if (collision) {
    var xVel = this.velocity_.getX();
    this.position_ = new dotprod.Vector(xVel >= 0 ? collision.left : collision.right, this.position_.getY());
    this.velocity_ = new dotprod.Vector(-xVel, this.velocity_.getY());
  }

  this.position_ = this.position_.add(this.velocity_.getYComponent());
  collision = map.getCollision(this);
  if (collision) {
    var yVel = this.velocity_.getY();
    this.position_ = new dotprod.Vector(this.position_.getX(), yVel >= 0 ? collision.top : collision.bottom);
    this.velocity_ = new dotprod.Vector(this.velocity_.getX(), -yVel);
  }

  var players = playerIndex.getPlayers();
  for (var i = 0; i < players.length; ++i) {
    if (this.checkPlayerCollision_(players[i])) {
      break;
    }
  }
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.Bullet.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  var x = this.position_.getX() - dimensions.left;
  var y = this.position_.getY() - dimensions.top;
  var r = dotprod.entities.Bullet.RADIUS_;

  if (x + r < 0 || y + r < 0 || x - r >= dimensions.width || y - r >= dimensions.height) {
    return;
  }

  context.save();
    var gradient = context.createRadialGradient(x, y, 0, x, y, dotprod.entities.Bullet.RADIUS_);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, this.color_);
    context.fillStyle = gradient;
    context.fillRect(x - r, y - r, r * 2, r * 2);
  context.restore();
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
    var animation = this.game_.getResourceManager().getVideoEnsemble('explode0').getAnimation(0);
    var explosion = new dotprod.entities.Effect(animation, this.position_, new dotprod.Vector(0, 0));
    this.game_.getEffectIndex().addEffect(explosion);
    player.takeDamage(this.owner_, this, this.damage_);
    this.lifetime_ = 0;
    return true;
  }
  return false;
};
