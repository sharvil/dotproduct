goog.provide('model.Gun');

goog.require('goog.asserts');
goog.require('math.Range');
goog.require('model.projectile.BulletGroup');
goog.require('model.Weapon.Type');

/**
 * @constructor
 * @implements model.Weapon
 * @param {!Game} game
 * @param {!Object} gunSettings
 * @param {!model.player.Player} owner
 */
model.Gun = function(game, gunSettings, owner) {
  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.gunSettings_ = gunSettings;

  /**
   * @type {!model.player.Player}
   * @private
   */
  this.owner_ = owner;

  /**
   * @type {!math.Range}
   * @private
   */
  this.level_ = new math.Range(Math.min(0, this.gunSettings_['maxLevel']), this.gunSettings_['maxLevel'], 1);
  this.level_.setValue(this.gunSettings_['initialLevel']);

  /**
   * @type {boolean}
   * @private
   */
  this.bouncingBullets_ = false;

  /**
   * @type {boolean}
   * @private
   */
  this.hasMultifire_ = false;

  /**
   * @type {boolean}
   * @private
   */
  this.isMultifireEnabled_ = false;
};

/**
 * @override
 */
model.Gun.prototype.getType = function() {
  return model.Weapon.Type.GUN;
};

/**
 * @return {number}
 */
model.Gun.prototype.getLevel = function() {
  return this.level_.getValue();
};

model.Gun.prototype.upgrade = function() {
  this.level_.increment();
};

/**
 * @param {boolean} bounces
 */
model.Gun.prototype.setBounces = function(bounces) {
  this.bouncingBullets_ = bounces;
};

/**
 * Grants the ability to shoot multifire bullets from this gun. Multifire can
 * only be granted if the 'multifire' section exists in the gun settings.
 */
model.Gun.prototype.grantMultifire = function() {
  // If multifire is a newly granted capability, enable it by default.
  if (!this.hasMultifire_) {
    this.hasMultifire_ = this.isMultifireEnabled_ = !!this.gunSettings_['multifire'];
  }
};

/**
 * Enables or disables multifire bullets on the gun. If the gun doesn't have
 * multifire, this function won't enable multifire.
 *
 * @param {boolean} enabled
 */
model.Gun.prototype.setMultifireEnabled = function(enabled) {
  this.isMultifireEnabled_ = this.hasMultifire_ && enabled;
};

/**
 * @param {number} angle
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {function(number, number): boolean} commitFireFn
 * @return {Object}
 */
model.Gun.prototype.fire = function(angle, position, velocity, commitFireFn) {
  var fireEnergy = this.getFireEnergy_();
  var fireDelay = this.getFireDelay_();
  var level = this.level_.getValue();

  if (level < 0 || !commitFireFn(fireEnergy, fireDelay)) {
    return null;
  }

  var factory = this.game_.getModelObjectFactory();
  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var bounceCount = this.getBounceCount_();
  var bulletSpeed = this.getBulletSpeed_();
  var multifireAngle = this.isMultifireEnabled_ ? this.gunSettings_['multifire']['angle'] : 0;

  var count = this.isMultifireEnabled_ ? 3 : 1;
  var bullets = [];
  for (var i = 0; i < count; ++i) {
    // Clever. This generates [-1, 0, 1] which we can use to multiply the angle
    // by and generate the multifire spread.
    var factor = (i - 1);
    var bulletVelocity = velocity.add(math.Vector.fromPolar(bulletSpeed, angle + multifireAngle * factor));

    var bullet = factory.newBullet(this.game_, this.owner_, level, position, bulletVelocity, lifetime, damage, bounceCount);

    bullets.push(bullet);
    this.owner_.addProjectile(bullet);
  }

  new model.projectile.BulletGroup(bullets);
  this.game_.getResourceManager().playSound('gun' + level);

  return {
    'type': this.getType(),
    'angle': angle,
    'level': level,
    'bounceCount': bounceCount,
    'multifire': this.isMultifireEnabled_
  }
};

/**
 * @override
 */
model.Gun.prototype.onFired = function(timeDiff, position, velocity, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire gun with incorrect weapon type: ' + weaponData['type']);

  var factory = this.game_.getModelObjectFactory();
  var level = weaponData['level'];
  var angle = weaponData['angle'];
  var bounceCount = weaponData['bounceCount'];
  var isMultifire = weaponData['multifire'];

  // Make sure the level is correct so the following getters use the right value for their calculations.
  this.level_.setValue(level);

  var factory = this.game_.getModelObjectFactory();
  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var bulletSpeed = this.getBulletSpeed_();
  var multifireAngle = isMultifire ? this.gunSettings_['multifire']['angle'] : 0;

  var count = isMultifire ? 3 : 1;
  var bullets = [];
  for (var i = 0; i < count; ++i) {
    // Clever. This generates [-1, 0, 1] which we can use to multiply the angle
    // by and generate the multifire spread.
    var factor = (i - 1);
    var bulletVelocity = velocity.add(math.Vector.fromPolar(bulletSpeed, angle + multifireAngle * factor));

    var bullet = factory.newBullet(this.game_, this.owner_, level, position, bulletVelocity, lifetime, damage, bounceCount);

    bullets.push(bullet);
    this.owner_.addProjectile(bullet);
  }

  new model.projectile.BulletGroup(bullets);

  for (var i = 0; i < timeDiff; ++i) {
    for (var j = 0; j < bullets.length; ++j) {
      bullets[j].advanceTime();
    }
  }
};

/**
 * @return {number}
 * @private
 */
model.Gun.prototype.getFireDelay_ = function() {
  return this.gunSettings_['fireDelay'];
};

/**
 * @return {number}
 * @private
 */
model.Gun.prototype.getFireEnergy_ = function() {
  return this.gunSettings_['fireEnergy'] * (this.level_.getValue() + 1);
};

/**
 * @return {number}
 * @private
 */
model.Gun.prototype.getBulletSpeed_ = function() {
  return this.gunSettings_['speed'];
};

/**
 * @return {number}
 * @private
 */
model.Gun.prototype.getLifetime_ = function() {
  return this.gunSettings_['lifetime'];
};

/**
 * @return {number}
 * @private
 */
model.Gun.prototype.getDamage_ = function() {
  return this.gunSettings_['damage'] + this.level_.getValue() * this.gunSettings_['damageUpgrade'];
};

/**
 * @return {number}
 * @private
 */
model.Gun.prototype.getBounceCount_ = function() {
  return this.gunSettings_['bounces'] && this.bouncingBullets_ ? -1 : 0;
};
