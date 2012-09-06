/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.LocalPlayer');

goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.object');
goog.require('dotprod.entities.Bomb');
goog.require('dotprod.entities.Bullet');
goog.require('dotprod.entities.Exhaust');
goog.require('dotprod.entities.Player');
goog.require('dotprod.Keymap');
goog.require('dotprod.Palette');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Player}
 * @param {!dotprod.Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} ship
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.LocalPlayer = function(game, id, name, ship, camera) {
  /**
   * @type {!dotprod.ProjectileIndex}
   * @private
   */
  this.projectileIndex_ = game.getProjectileIndex();

  /**
   * @type {!dotprod.Camera} camera
   * @private
   */
  this.camera_ = camera;

  /**
   * @type {number}
   * @private
   */
  this.projectileFireDelay_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.shipChangeDelay_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.respawnTimer_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.ticksSincePositionUpdate_ = 999999;

  /**
   * @type {!Array.<!dotprod.entities.Exhaust>}
   * @private
   */
  this.exhaust_ = [];

  /**
   * @type {number}
   * @private
   */
  this.exhaustTimer_ = 0;

  dotprod.entities.Player.call(this, game, id, name, ship, 0 /* bounty */);
};
goog.inherits(dotprod.entities.LocalPlayer, dotprod.entities.Player);

/**
 * @override
 */
dotprod.entities.LocalPlayer.prototype.collectPrize_ = function(prize) {
  goog.base(this, 'collectPrize_', prize);

  // TODO(sharvil): we shouldn't reach into game's private member...
  switch (prize.getType()) {
    case dotprod.Prize.Type.NONE:
      this.game_.notifications_.addMessage('No prize for you. Sadface.');
      break;
    case dotprod.Prize.Type.GUN_UPGRADE:
      this.gun_.upgrade();
      this.game_.notifications_.addMessage('Guns upgraded!');
      break;
    case dotprod.Prize.Type.BOMB_UPGRADE:
      this.bombBay_.upgrade();
      this.game_.notifications_.addMessage('Bombs upgraded!');
      break;
    case dotprod.Prize.Type.FULL_ENERGY:
      this.game_.notifications_.addMessage('Full charge!');
      this.energy_ = this.maxEnergy_;
      break;
    case dotprod.Prize.Type.BOUNCING_BULLETS:
      this.game_.notifications_.addMessage('Bouncing bullets!');
      this.gun_.setBounces(true);
      break;
  }
  this.game_.getProtocol().sendPrizeCollected(prize.getType(), prize.getX(), prize.getY());
  ++this.bounty_;
  return true;
};

/**
 * @param {!dotprod.entities.Player} shooter
 * @param {!dotprod.entities.Projectile} projectile
 * @param {number} energy
 * @override
 */
dotprod.entities.LocalPlayer.prototype.takeDamage = function(shooter, projectile, energy) {
  if (!this.isAlive()) {
    return;
  }

  this.energy_ = Math.max(this.energy_ - energy, (shooter == this) ? 1 : 0);
  if (this.energy_ <= 0) {
    var bountyGained = this.bounty_;
    this.onDeath();
    shooter.onKill(this, bountyGained);

    this.game_.getProtocol().sendDeath(this.position_, shooter);

    // TODO(sharvil): we shouldn't reach into game's private member...
    this.game_.notifications_.addPersonalMessage('You were killed by ' + shooter.getName() + '!');
  }
};

/**
 * @override
 */
dotprod.entities.LocalPlayer.prototype.onDeath = function() {
  goog.base(this, 'onDeath');
  this.respawnTimer_ = this.shipSettings_['respawnDelay'];
};

dotprod.entities.LocalPlayer.prototype.respawn = function() {
  this.angleInRadians_ = Math.random() * 2 * Math.PI;
  this.position_ = this.game_.getMap().getSpawnLocation(this);
  this.velocity_ = new dotprod.Vector(0, 0);
  this.energy_ = this.shipSettings_['maxEnergy'];
  this.maxEnergy_ = this.shipSettings_['maxEnergy'];
  this.projectileIndex_.removeProjectiles(this);

  this.warpFlash();
};

/**
 * @override
 */
dotprod.entities.LocalPlayer.prototype.setShip = function(ship) {
  goog.base(this, 'setShip', ship);
  this.respawn();
};

/**
 * @override
 */
dotprod.entities.LocalPlayer.prototype.setPresence = function(presence) {
  goog.base(this, 'setPresence', presence);
  this.game_.getProtocol().sendSetPresence(this.presence_);
};

/**
 * @override
 */
dotprod.entities.LocalPlayer.prototype.clearPresence = function(presence) {
  goog.base(this, 'clearPresence', presence);
  this.game_.getProtocol().sendSetPresence(this.presence_);
};

dotprod.entities.LocalPlayer.prototype.update = function() {
  var keyboard = this.game_.getKeyboard();
  var dimensions = this.camera_.getDimensions();
  var forceSendUpdate = false;

  ++this.ticksSincePositionUpdate_;

  if (this.respawnTimer_ > 0) {
    if (--this.respawnTimer_ != 0) {
      return;
    }
    this.setShip(this.ship_);
    forceSendUpdate = true;
  }

  // Check for ship change before we read any ship settings.
  this.shipChangeDelay_ = Math.max(this.shipChangeDelay_ - 1, 0);
  if (this.shipChangeDelay_ <= 0) {
    for (var i = 0; i < this.settings_['ships'].length; ++i) {
      if (keyboard.isKeyPressed(goog.events.KeyCodes.ONE + i)) {
        if (i != this.ship_) {
          if (this.energy_ >= this.maxEnergy_) {
            this.setShip(i);
            this.game_.getProtocol().sendShipChange(this.ship_);
            forceSendUpdate = true;
          } else {
            // TODO(sharvil): we shouldn't reach into game's private member...
            this.game_.notifications_.addMessage('You must have full energy to change ships.');
          }
          this.shipChangeDelay_ = 300;  // 3 seconds.
        }
        break;
      }
    }
  }

  var shipRotation = this.shipSettings_['rotationRadiansPerTick'];
  var bounceFactor = this.shipSettings_['bounceFactor'];
  var rechargeRate = this.shipSettings_['rechargeRate'];

  var oldAngle = this.angleInRadians_;
  var oldVelocity = this.velocity_;
  var projectile;

  this.projectileFireDelay_ = Math.max(this.projectileFireDelay_ - 1, 0);
  this.energy_ = Math.min(this.energy_ + rechargeRate, this.maxEnergy_);

  if (this.projectileFireDelay_ <= 0) {
    if (keyboard.isKeyPressed(dotprod.Keymap.FIRE_GUN)) {
      var angle = this.getAngle_();
      var position = new dotprod.Vector(0, -this.yRadius_).rotate(angle).add(this.position_);
      var velocity = this.velocity_;

      projectile = this.gun_.fire(angle, position, velocity, goog.bind(function(fireEnergy, fireDelay) {
        if (this.energy_ > fireEnergy) {
          this.energy_ -= fireEnergy;
          this.projectileFireDelay_ = fireDelay;
          return true;
        }
        return false;
      }, this));
    } else if (keyboard.isKeyPressed(dotprod.Keymap.FIRE_BOMB)) {
      var angle = this.getAngle_();
      var position = new dotprod.Vector(0, -this.yRadius_).rotate(angle).add(this.position_);
      var velocity = this.velocity_;

      projectile = this.bombBay_.fire(angle, position, velocity, goog.bind(function(fireEnergy, fireDelay, recoil) {
        if (this.energy_ > fireEnergy) {
          this.energy_ -= fireEnergy;
          this.projectileFireDelay_ = fireDelay;
          this.velocity_ = this.velocity_.subtract(dotprod.Vector.fromPolar(recoil, angle));
          return true;
        }
        return false;
      }, this));
    }
  }

  if (keyboard.isKeyPressed(dotprod.Keymap.ROTATE_LEFT)) {
    this.angleInRadians_ -= shipRotation;
  } else if (keyboard.isKeyPressed(dotprod.Keymap.ROTATE_RIGHT)) {
    this.angleInRadians_ += shipRotation;
  }

  if (this.angleInRadians_ < 0 || this.angleInRadians_ >= Math.PI * 2) {
    this.angleInRadians_ -= Math.floor(this.angleInRadians_ / (2 * Math.PI)) * 2 * Math.PI;
  }

  var angle = this.getAngle_();

  // Update and invalidate any existing exhaust trails.
  --this.exhaustTimer_;
  var newExhaust = [];
  for (var i = 0; i < this.exhaust_.length; ++i) {
    this.exhaust_[i].update();
    if (this.exhaust_[i].isAlive()) {
      newExhaust.push(this.exhaust_[i]);
    }
  }
  this.exhaust_ = newExhaust;

  var maximumSpeed = this.shipSettings_['speedPixelsPerTick'];
  var acceleration = this.shipSettings_['accelerationPerTick'];
  var accelerationEnergy = 0;
  if (keyboard.isKeyPressed(goog.events.KeyCodes.SHIFT) && this.energy_ > this.shipSettings_['afterburnerEnergy']) {
    maximumSpeed = this.shipSettings_['afterburnerMaxSpeed'];
    acceleration = this.shipSettings_['afterburnerAcceleration'];
    accelerationEnergy = this.shipSettings_['afterburnerEnergy'];
  }

  if (keyboard.isKeyPressed(dotprod.Keymap.FORWARD_THRUST)) {
    this.applyThrust_(dotprod.Vector.fromPolar(acceleration, angle));
    this.energy_ -= accelerationEnergy;
  } else if (keyboard.isKeyPressed(dotprod.Keymap.REVERSE_THRUST)) {
    this.applyThrust_(dotprod.Vector.fromPolar(acceleration, angle).scale(-1));
    this.energy_ -= accelerationEnergy;
  }

  if (keyboard.isKeyPressed(dotprod.Keymap.STRAFE_LEFT)) {
    this.velocity_ = this.velocity_.add(dotprod.Vector.fromPolar(-acceleration, angle + Math.PI / 2));
  } else if (keyboard.isKeyPressed(dotprod.Keymap.STRAFE_RIGHT)) {
    this.velocity_ = this.velocity_.add(dotprod.Vector.fromPolar(acceleration, angle + Math.PI / 2));
  }

  // Magnitude of speed is greater than maximum ship speed - clamp.
  var magnitude = this.velocity_.magnitude();
  if (magnitude >= maximumSpeed) {
    this.velocity_ = this.velocity_.resize(maximumSpeed);
  }

  this.updatePosition_(bounceFactor);
  this.camera_.setPosition(Math.floor(this.position_.getX()), Math.floor(this.position_.getY()));
  this.sendPositionUpdate_(forceSendUpdate, this.velocity_ != oldVelocity || this.angleInRadians_ != oldAngle, projectile);
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.LocalPlayer.prototype.render = function(camera) {
  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  if (!this.isAlive()) {
    var millis = dotprod.Timer.ticksToMillis(this.respawnTimer_);
    var seconds = Math.floor(millis / 1000);
    var tenths = Math.floor((millis % 1000) / 100);
    var time = seconds + '.' + tenths;
    context.save();
      context.font = dotprod.FontFoundry.playerFont();
      context.fillStyle = dotprod.Palette.friendColor();
      context.fillText(time, dimensions.width / 2, dimensions.height / 2);
    context.restore();
    return;
  }

  for (var i = 0; i < this.exhaust_.length; ++i) {
    this.exhaust_[i].render(camera);
  }

  goog.base(this, 'render', camera);

  var barWidth = 300 * this.energy_ / this.maxEnergy_;
  var barHeight = 10;

  context.save();
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect((dimensions.width - barWidth) / 2, 10, barWidth, barHeight);
  context.restore();
};

/**
 * @param {!dotprod.Vector} thrustVector
 * @private
 */
dotprod.entities.LocalPlayer.prototype.applyThrust_ = function(thrustVector) {
  this.velocity_ = this.velocity_.add(thrustVector);

  if (this.exhaustTimer_ > 0) {
    return;
  }

  var angle = this.getAngle_();
  var bottomOfShip = this.position_.subtract(dotprod.Vector.fromPolar(this.yRadius_, angle));
  var exhaustVelocity = this.velocity_.subtract(thrustVector.resize(5));
  var perpendicular = dotprod.Vector.fromPolar(1, angle + Math.PI / 2);

  var e1 = new dotprod.entities.Exhaust(this.game_, bottomOfShip.add(perpendicular.scale(3)), exhaustVelocity.add(perpendicular));
  var e2 = new dotprod.entities.Exhaust(this.game_, bottomOfShip.subtract(perpendicular.scale(3)), exhaustVelocity.subtract(perpendicular));
  this.exhaust_.push(e1);
  this.exhaust_.push(e2);
  this.exhaustTimer_ = 6;
};

/**
 * @param {boolean} forceSendUpdate
 * @param {boolean} isAccelerating
 * @param {!dotprod.entities.Projectile=} opt_projectile
 */
dotprod.entities.LocalPlayer.prototype.sendPositionUpdate_ = function(forceSendUpdate, isAccelerating, opt_projectile) {
  if (!forceSendUpdate) {
    var sendPositionDelay = this.settings_['network']['sendPositionDelay'];
    if (isAccelerating) {
      sendPositionDelay = this.settings_['network']['fastSendPositionDelay'];
    }

    if (!opt_projectile && this.ticksSincePositionUpdate_ < sendPositionDelay) {
      return;
    }
  }

  this.game_.getProtocol().sendPosition(this.angleInRadians_, this.position_, this.velocity_, opt_projectile);
  this.ticksSincePositionUpdate_ = 0;
};

/**
 * @return {number}
 */
dotprod.entities.LocalPlayer.prototype.getAngle_ = function() {
  return 2 * Math.PI * Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles()) / this.image_.getNumTiles();
};
