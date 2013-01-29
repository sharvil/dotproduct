/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.player.LocalPlayer');

goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.object');

goog.require('dotprod.input.Keymap');
goog.require('dotprod.math.Range');
goog.require('dotprod.math.Vector');
goog.require('dotprod.model.projectile.Bomb');
goog.require('dotprod.model.projectile.Bullet');
goog.require('dotprod.model.Exhaust');
goog.require('dotprod.model.player.Player');
goog.require('dotprod.PrizeType');

/**
 * @constructor
 * @extends {dotprod.model.player.Player}
 * @param {!dotprod.Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {number} ship
 */
dotprod.model.player.LocalPlayer = function(game, id, name, team, ship) {

  /**
   * @type {!dotprod.math.Range}
   * @private
   */
  this.projectileFireDelay_ = new dotprod.math.Range(0, Number.MAX_VALUE, 1);

  /**
   * @type {!dotprod.math.Range}
   * @private
   */
  this.shipChangeDelay_ = new dotprod.math.Range(0, 300, 1);  // 3 seconds

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
   * @type {!Array.<!dotprod.model.Exhaust>}
   * @private
   */
  this.exhaust_ = [];

  /**
   * @type {!dotprod.math.Range}
   * @private
   */
  this.exhaustTimer_ = new dotprod.math.Range(0, 6, 1);

  goog.base(this, game, id, name, team, ship, 0 /* bounty */);
};
goog.inherits(dotprod.model.player.LocalPlayer, dotprod.model.player.Player);

/**
 * @type {number}
 * @const
 * @private
 */
dotprod.model.player.LocalPlayer.ANGLE_STEPS_ = 40;

/**
 * @override
 */
dotprod.model.player.LocalPlayer.prototype.collectPrize_ = function(prize) {
  goog.base(this, 'collectPrize_', prize);

  // TODO(sharvil): we shouldn't reach into game's private member...
  switch (prize.getType()) {
    case dotprod.PrizeType.NONE:
      this.game_.notifications_.addMessage('No prize for you. Sadface.');
      break;
    case dotprod.PrizeType.GUN_UPGRADE:
      this.gun_.upgrade();
      this.game_.notifications_.addMessage('Guns upgraded!');
      break;
    case dotprod.PrizeType.BOMB_UPGRADE:
      this.bombBay_.upgrade();
      this.game_.notifications_.addMessage('Bombs upgraded!');
      break;
    case dotprod.PrizeType.FULL_ENERGY:
      this.game_.notifications_.addMessage('Full charge!');
      this.energy_ = this.maxEnergy_;
      break;
    case dotprod.PrizeType.BOUNCING_BULLETS:
      this.game_.notifications_.addMessage('Bouncing bullets!');
      this.gun_.setBounces(true);
      break;
  }
  this.game_.getProtocol().sendPrizeCollected(prize.getType(), prize.getX(), prize.getY());
  ++this.bounty_;
  return true;
};

/**
 * @override
 */
dotprod.model.player.LocalPlayer.prototype.onDamage = function(shooter, projectile, energy) {
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
dotprod.model.player.LocalPlayer.prototype.onDeath = function() {
  goog.base(this, 'onDeath');
  this.respawnTimer_ = this.shipSettings_['respawnDelay'];
};

/**
 * @override
 */
dotprod.model.player.LocalPlayer.prototype.respawn = function(angle, position, velocity) {
  this.angleInRadians_ = angle;
  this.position_ = position;
  this.velocity_ = velocity;
  this.energy_ = this.shipSettings_['maxEnergy'];
  this.maxEnergy_ = this.shipSettings_['maxEnergy'];
};

/**
 * @override
 */
dotprod.model.player.LocalPlayer.prototype.setShip = function(ship) {
  goog.base(this, 'setShip', ship);

  var angle = Math.random() * 2 * Math.PI;
  var position = this.game_.getMap().getSpawnLocation(this);
  var velocity = new dotprod.math.Vector(0, 0);
  this.respawn(angle, position, velocity);
};

/**
 * @override
 */
dotprod.model.player.LocalPlayer.prototype.setPresence = function(presence) {
  goog.base(this, 'setPresence', presence);
  this.game_.getProtocol().sendSetPresence(this.presence_);
};

/**
 * @override
 */
dotprod.model.player.LocalPlayer.prototype.clearPresence = function(presence) {
  goog.base(this, 'clearPresence', presence);
  this.game_.getProtocol().sendSetPresence(this.presence_);
};

/**
 * @override
 */
dotprod.model.player.LocalPlayer.prototype.advanceTime = function() {
  var forceSendUpdate = false;
  var keyboard = this.game_.getKeyboard();

  --this.respawnTimer_;
  if (this.respawnTimer_ > 0) {
    return;
  } else if (this.respawnTimer_ == 0) {
    this.setShip(this.ship_);
    forceSendUpdate = true;
  }

  ++this.ticksSincePositionUpdate_;
  this.shipChangeDelay_.decrement();
  this.projectileFireDelay_.decrement();
  this.exhaustTimer_.decrement();
  this.energy_ = Math.min(this.energy_ + this.shipSettings_['rechargeRate'], this.maxEnergy_);
  this.exhaust_ = goog.array.filter(this.exhaust_, function(e) { return e.isValid(); });

  // Check for ship change before we read any ship settings.
  if (this.shipChangeDelay_.isLow()) {
    for (var i = 0; i < this.settings_['ships'].length; ++i) {
      var keycode = /** @type {goog.events.KeyCodes} */ (goog.events.KeyCodes.ONE + i);
      if (keyboard.isKeyPressed(keycode)) {
        if (i != this.ship_) {
          if (this.energy_ >= this.maxEnergy_) {
            this.setShip(i);
            this.game_.getProtocol().sendShipChange(this.ship_);
            forceSendUpdate = true;
          } else {
            // TODO(sharvil): we shouldn't reach into game's private member...
            this.game_.notifications_.addMessage('You must have full energy to change ships.');
          }
          this.shipChangeDelay_.setHigh();
        }
        break;
      }
    }
  }

  var oldAngle = this.angleInRadians_;
  var oldVelocity = this.velocity_;
  var projectile;

  if (this.projectileFireDelay_.isLow()) {
    if (keyboard.isKeyPressed(dotprod.input.Keymap.FIRE_GUN)) {
      var angle = this.getAngle_();
      var position = new dotprod.math.Vector(0, -this.yRadius_).rotate(angle).add(this.position_);
      var velocity = this.velocity_;

      projectile = this.gun_.fire(angle, position, velocity, goog.bind(function(fireEnergy, fireDelay) {
        if (this.energy_ > fireEnergy) {
          this.energy_ -= fireEnergy;
          this.projectileFireDelay_.setValue(fireDelay);
          return true;
        }
        return false;
      }, this));
    } else if (keyboard.isKeyPressed(dotprod.input.Keymap.FIRE_BOMB)) {
      var angle = this.getAngle_();
      var position = new dotprod.math.Vector(0, -this.yRadius_).rotate(angle).add(this.position_);
      var velocity = this.velocity_;

      projectile = this.bombBay_.fire(angle, position, velocity, goog.bind(function(fireEnergy, fireDelay, recoil) {
        if (this.energy_ > fireEnergy) {
          this.energy_ -= fireEnergy;
          this.projectileFireDelay_.setValue(fireDelay);
          this.velocity_ = this.velocity_.subtract(dotprod.math.Vector.fromPolar(recoil, angle));
          return true;
        }
        return false;
      }, this));
    }
    if (projectile) {
      this.addProjectile_(projectile);
    }
  }

  var shipRotation = this.shipSettings_['rotationRadiansPerTick'];
  if (keyboard.isKeyPressed(dotprod.input.Keymap.ROTATE_LEFT)) {
    this.angleInRadians_ -= shipRotation;
  } else if (keyboard.isKeyPressed(dotprod.input.Keymap.ROTATE_RIGHT)) {
    this.angleInRadians_ += shipRotation;
  }

  if (this.angleInRadians_ < 0 || this.angleInRadians_ >= Math.PI * 2) {
    this.angleInRadians_ -= Math.floor(this.angleInRadians_ / (2 * Math.PI)) * 2 * Math.PI;
  }

  var angle = this.getAngle_();
  var maximumSpeed = this.shipSettings_['speedPixelsPerTick'];
  var acceleration = this.shipSettings_['accelerationPerTick'];
  var accelerationEnergy = 0;
  if (keyboard.isKeyPressed(dotprod.input.Keymap.AFTERBURNER) && this.energy_ > this.shipSettings_['afterburnerEnergy']) {
    maximumSpeed = this.shipSettings_['afterburnerMaxSpeed'];
    acceleration = this.shipSettings_['afterburnerAcceleration'];
    accelerationEnergy = this.shipSettings_['afterburnerEnergy'];
  }

  if (keyboard.isKeyPressed(dotprod.input.Keymap.FORWARD_THRUST)) {
    this.applyThrust_(dotprod.math.Vector.fromPolar(acceleration, angle));
    this.energy_ -= accelerationEnergy;
  } else if (keyboard.isKeyPressed(dotprod.input.Keymap.REVERSE_THRUST)) {
    this.applyThrust_(dotprod.math.Vector.fromPolar(acceleration, angle).scale(-1));
    this.energy_ -= accelerationEnergy;
  }

  if (keyboard.isKeyPressed(dotprod.input.Keymap.STRAFE_LEFT)) {
    this.velocity_ = this.velocity_.add(dotprod.math.Vector.fromPolar(-acceleration, angle + Math.PI / 2));
  } else if (keyboard.isKeyPressed(dotprod.input.Keymap.STRAFE_RIGHT)) {
    this.velocity_ = this.velocity_.add(dotprod.math.Vector.fromPolar(acceleration, angle + Math.PI / 2));
  }

  // Magnitude of speed is greater than maximum ship speed - clamp.
  var magnitude = this.velocity_.magnitude();
  if (magnitude >= maximumSpeed) {
    this.velocity_ = this.velocity_.resize(maximumSpeed);
  }

  this.updatePosition_(this.shipSettings_['bounceFactor']);
  this.sendPositionUpdate_(forceSendUpdate, this.velocity_ != oldVelocity || this.angleInRadians_ != oldAngle, projectile);
};

/**
 * @param {!dotprod.math.Vector} thrustVector
 * @private
 */
dotprod.model.player.LocalPlayer.prototype.applyThrust_ = function(thrustVector) {
  this.velocity_ = this.velocity_.add(thrustVector);

  if (!this.exhaustTimer_.isLow()) {
    return;
  }

  var angle = this.getAngle_();
  var bottomOfShip = this.position_.subtract(dotprod.math.Vector.fromPolar(this.yRadius_, angle));
  var exhaustVelocity = this.velocity_.subtract(thrustVector.resize(5));
  var perpendicular = dotprod.math.Vector.fromPolar(1, angle + Math.PI / 2);

  var e1 = new dotprod.model.Exhaust(this.game_, bottomOfShip.add(perpendicular.scale(3)), exhaustVelocity.add(perpendicular));
  var e2 = new dotprod.model.Exhaust(this.game_, bottomOfShip.subtract(perpendicular.scale(3)), exhaustVelocity.subtract(perpendicular));
  this.exhaust_.push(e1);
  this.exhaust_.push(e2);
  this.exhaustTimer_.setHigh();
};

/**
 * @param {boolean} forceSendUpdate
 * @param {boolean} isAccelerating
 * @param {dotprod.model.projectile.Projectile=} opt_projectile
 */
dotprod.model.player.LocalPlayer.prototype.sendPositionUpdate_ = function(forceSendUpdate, isAccelerating, opt_projectile) {
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
dotprod.model.player.LocalPlayer.prototype.getAngle_ = function() {
  return 2 * Math.PI * Math.floor(this.angleInRadians_ / (2 * Math.PI) * dotprod.model.player.LocalPlayer.ANGLE_STEPS_) / dotprod.model.player.LocalPlayer.ANGLE_STEPS_;
};
