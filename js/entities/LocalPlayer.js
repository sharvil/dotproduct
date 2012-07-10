/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.LocalPlayer');

goog.require('goog.events');
goog.require('goog.object');
goog.require('dotprod.entities.Bomb');
goog.require('dotprod.entities.Bullet');
goog.require('dotprod.entities.Exhaust');
goog.require('dotprod.entities.Player');
goog.require('dotprod.Palette');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Player}
 * @param {!dotprod.Game} game
 * @param {string} name
 * @param {number} ship
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.LocalPlayer = function(game, name, ship, camera) {
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
  this.respawnTimer_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.ticksSincePositionUpdate_ = 999999;

  dotprod.entities.Player.call(this, game, name, ship, 0 /* bounty */);
};
goog.inherits(dotprod.entities.LocalPlayer, dotprod.entities.Player);

dotprod.entities.LocalPlayer.prototype.collectPrize = function(prize) {
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
};

/**
 * @param {!dotprod.entities.Player} shooter
 * @param {!dotprod.entities.Projectile} projectile
 * @param {number} energy
 * @override
 */
dotprod.entities.LocalPlayer.prototype.takeDamage = function(shooter, projectile, energy) {
  this.energy_ -= energy;
  if (this.energy_ <= 0) {
    var bountyGained = this.bounty_;
    this.onDeath();
    shooter.onKill(this, bountyGained);

    this.game_.getProtocol().sendDeath(shooter.getName());

    // TODO(sharvil): we shouldn't reach into game's private member...
    this.game_.notifications_.addMessage('You were killed by ' + shooter.getName() + '!');
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
  for (var i = 0; i < this.settings_['ships'].length; ++i) {
    if (keyboard.isKeyPressed(goog.events.KeyCodes.ONE + i)) {
      if (i != this.ship_ && this.energy_ >= this.maxEnergy_) {
        this.setShip(i);
        this.game_.getProtocol().sendShipChange(this.ship_);
        forceSendUpdate = true;
      }
      break;
    }
  }

  var shipRotation = this.shipSettings_['rotationRadiansPerTick'];
  var shipSpeed = this.shipSettings_['speedPixelsPerTick'];
  var acceleration = this.shipSettings_['accelerationPerTick'];
  var bounceFactor = this.shipSettings_['bounceFactor'];
  var rechargeRate = this.shipSettings_['rechargeRate'];
  var bulletFireDelay = this.shipSettings_['bullet']['fireDelay'];
  var bulletFireEnergy = this.shipSettings_['bullet']['fireEnergy'];
  var bulletSpeed = this.shipSettings_['bullet']['speed'];
  var bombFireDelay = this.shipSettings_['bomb']['fireDelay'];
  var bombFireEnergy = this.shipSettings_['bomb']['fireEnergy'];
  var bombSpeed = this.shipSettings_['bomb']['speed'];

  var oldAngle = this.angleInRadians_;
  var oldVelocity = this.velocity_;
  var projectile;

  this.projectileFireDelay_ = Math.max(this.projectileFireDelay_ - 1, 0);
  this.energy_ = Math.min(this.energy_ + rechargeRate, this.maxEnergy_);

  if (this.projectileFireDelay_ <= 0) {
    if (keyboard.isKeyPressed(goog.events.KeyCodes.CTRL)) {
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
    } else if (keyboard.isKeyPressed(goog.events.KeyCodes.TAB)) {
      var angle = this.getAngle_();
      var position = new dotprod.Vector(0, -this.yRadius_).rotate(angle).add(this.position_);
      var velocity = this.velocity_;

      projectile = this.bombBay_.fire(angle, position, velocity, goog.bind(function(fireEnergy, fireDelay) {
        if (this.energy_ > fireEnergy) {
          this.energy_ -= fireEnergy;
          this.projectileFireDelay_ = fireDelay;
          return true;
        }
        return false;
      }, this));
    }
  }

  if (keyboard.isKeyPressed(goog.events.KeyCodes.LEFT)) {
    this.angleInRadians_ -= shipRotation;
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.RIGHT)) {
    this.angleInRadians_ += shipRotation;
  }

  if (this.angleInRadians_ < 0 || this.angleInRadians_ >= Math.PI * 2) {
    this.angleInRadians_ -= Math.floor(this.angleInRadians_ / (2 * Math.PI)) * 2 * Math.PI;
  }

  var angle = this.getAngle_();

/*
  var newExhaust = [];
  for (var i = 0; i < this.exhaust_.length; ++i) {
    this.exhaust_[i].update();
    if (this.exhaust_[i].isAlive()) {
      newExhaust.push(this.exhaust_[i]);
    }
  }
  this.exhaust_ = newExhaust;
*/

  if (keyboard.isKeyPressed(goog.events.KeyCodes.UP)) {
    this.velocity_ = this.velocity_.add(dotprod.Vector.fromPolar(acceleration, angle));
  } else if (keyboard.isKeyPressed(goog.events.KeyCodes.DOWN)) {
    this.velocity_ = this.velocity_.subtract(dotprod.Vector.fromPolar(acceleration, angle));
  }

  // Magnitude of speed is greater than maximum ship speed - clamp.
  var magnitude = this.velocity_.magnitude();
  if (magnitude >= shipSpeed) {
    this.velocity_ = this.velocity_.scale(shipSpeed / magnitude);
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

/*
  for (var i = 0; i < this.exhaust_.length; ++i) {
    this.exhaust_[i].render(camera);
  }
*/

  goog.base(this, 'render', camera);

  var barWidth = 300 * this.energy_ / this.maxEnergy_;
  var barHeight = 10;

  context.save();
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect((dimensions.width - barWidth) / 2, 10, barWidth, barHeight);
  context.restore();
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
