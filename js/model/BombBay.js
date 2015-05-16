goog.provide('model.BombBay');

goog.require('goog.asserts');
goog.require('math.Range');
goog.require('model.Weapon.Type');

/**
 * @constructor
 * @implements {model.Weapon}
 * @param {!Game} game
 * @param {!Object} bombBaySettings
 * @param {!model.player.Player} owner
 */
model.BombBay = function(game, bombBaySettings, owner) {
  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.bombBaySettings_ = bombBaySettings;

  /**
   * @type {!model.player.Player}
   * @private
   */
  this.owner_ = owner;

  /**
   * @type {!math.Range}
   * @private
   */
  this.level_ = new math.Range(Math.min(0, bombBaySettings['maxLevel']), bombBaySettings['maxLevel'], 1);
  this.level_.setValue(bombBaySettings['initialLevel']);
};

/**
 * @override
 */
model.BombBay.prototype.getType = function() {
  return model.Weapon.Type.BOMB;
};

/**
 * @return {number}
 */
model.BombBay.prototype.getLevel = function() {
  return this.level_.getValue();
};

model.BombBay.prototype.upgrade = function() {
  this.level_.increment();
};

/**
 * @param {number} angle
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {boolean} isMine
 * @param {function(number, number, number): boolean} commitFireFn
 * @return {Object}
 */
model.BombBay.prototype.fire = function(angle, position, velocity, isMine, commitFireFn) {
  var level = this.level_.getValue();
  if(level < 0) {
    return null;
  }

  var fireEnergy = this.getFireEnergy_();
  var fireDelay = this.getFireDelay_();
  var recoilAcceleration = isMine ? 0 : this.getRecoilAcceleration_();

  if (!commitFireFn(fireEnergy, fireDelay, recoilAcceleration)) {
    return null;
  }

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var bounceCount = this.getBounceCount_();
  var blastRadius = this.getBlastRadius_();
  var proxRadius = this.getProxRadius_();
  var newVelocity = isMine ? math.Vector.ZERO : velocity.add(math.Vector.fromPolar(this.getBombSpeed_(), angle));
  var projectile = this.game_.getModelObjectFactory().newBomb(this.game_, this.owner_, level, position, newVelocity, lifetime, damage, bounceCount, blastRadius, proxRadius);

  this.owner_.addProjectile(projectile);

  if (isMine) {
    this.game_.getResourceManager().playSound('mine' + level);
  } else {
    this.game_.getResourceManager().playSound('bomb' + level);
  }

  return {
    'type': this.getType(),
    'level': level,
    'vel': newVelocity.toArray(),
    'bounceCount': bounceCount
  };
};

/**
 * @override
 */
model.BombBay.prototype.onFired = function(timeDiff, position, velocity, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire bomb with incorrect weapon type: ' + weaponData['type']);

  var level = weaponData['level'];
  var bounceCount = weaponData['bounceCount'];
  velocity = math.Vector.fromArray(weaponData['vel']);

  // Make sure the level is correct so the following getters use the right value for their calculations.
  this.level_.setValue(level);

  var projectile = this.game_.getModelObjectFactory().newBomb(this.game_, this.owner_, this.level_.getValue(), position, velocity, this.getLifetime_(), this.getDamage_(), bounceCount, this.getBlastRadius_(), this.getProxRadius_());
  for (var i = 0; i < timeDiff; ++i) {
    projectile.advanceTime();
  }
  this.owner_.addProjectile(projectile);
};

/**
 * @return {number}
 * @private
 */
model.BombBay.prototype.getFireDelay_ = function() {
  return this.bombBaySettings_['fireDelay'];
};

/**
 * @return {number}
 * @private
 */
model.BombBay.prototype.getFireEnergy_ = function() {
  return this.bombBaySettings_['fireEnergy'];
};

/**
 * @return {number}
 * @private
 */
model.BombBay.prototype.getBombSpeed_ = function() {
  return this.bombBaySettings_['speed'];
};

/**
 * @return {number}
 * @private
 */
model.BombBay.prototype.getBounceCount_ = function() {
  return this.bombBaySettings_['bounceCount'];
};

/**
 * @return {number}
 * @private
 */
model.BombBay.prototype.getLifetime_ = function() {
  return this.bombBaySettings_['lifetime'];
};

/**
 * @return {number}
 * @private
 */
model.BombBay.prototype.getDamage_ = function() {
  return this.bombBaySettings_['damage'] + this.level_.getValue() * this.bombBaySettings_['damageUpgrade'];
};

/**
 * @return {number}
 * @private
 */
model.BombBay.prototype.getBlastRadius_ = function() {
  return this.bombBaySettings_['blastRadius'] + this.level_.getValue() * this.bombBaySettings_['blastRadiusUpgrade'];
};

/**
 * @return {number}
 * @private
 */
model.BombBay.prototype.getProxRadius_ = function() {
  return this.bombBaySettings_['proxRadius'] + this.level_.getValue() * this.bombBaySettings_['proxRadiusUpgrade'];
};

/**
 * @return {number}
 * @private
 */
model.BombBay.prototype.getRecoilAcceleration_ = function() {
  return this.bombBaySettings_['recoilAcceleration'];
};
