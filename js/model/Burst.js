goog.provide('model.Burst');

goog.require('goog.asserts');
goog.require('math.Vector');
goog.require('model.Weapon.Type');

/**
 * @constructor
 * @param {!Game} game
 * @param {!Object} burstSettings
 * @param {!model.player.Player} owner
 */
model.Burst = function(game, burstSettings, owner) {
  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = burstSettings;

  /**
   * @type {!model.player.Player}
   * @private
   */
  this.owner_ = owner;

  /**
   * @type {number}
   * @private
   */
  this.count_ = this.settings_['initialCount'];
};

/**
 * @override
 */
model.Burst.prototype.getType = function() {
  return model.Weapon.Type.BURST;
};

/**
 * @return {number}
 */
model.Burst.prototype.getCount = function() {
  return this.count_;
};

/**
 * @param {!math.Vector} position
 * @param {function(number, number, number): boolean} commitFireFn
 * @return {Object}
 */
model.Burst.prototype.fire = function(position, commitFireFn) {
  if (this.count_ <= 0 || !commitFireFn(0 /* fireEnergy */, this.settings_['fireDelay'])) {
    return null;
  }

  --this.count_;
  var shrapnelCount = this.settings_['shrapnelCount'];
  var lifetime = this.settings_['lifetime'];
  var damage = this.settings_['damage'];

  for (var i = 0; i < shrapnelCount; ++i) {
    var velocity = math.Vector.fromPolar(this.settings_['speed'], i * 2 * Math.PI / shrapnelCount).add(this.owner_.getVelocity());
    var projectile = this.game_.getModelObjectFactory().newBurst(this.game_, this.owner_, this.owner_.getPosition(), velocity, lifetime, damage);
    this.owner_.addProjectile(projectile);
  }

  return {
    'type': this.getType(),
    'pos': this.owner_.getPosition().toArray(),
    'vel': this.owner_.getVelocity().toArray()
  };
};

/**
 * @override
 */
model.Burst.prototype.onFired = function(timeDiff, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire burst with incorrect weapon type: ' + weaponData['type']);

  var position = math.Vector.fromArray(weaponData['pos']);
  var velocity = math.Vector.fromArray(weaponData['vel']);

  var shrapnelCount = this.settings_['shrapnelCount'];
  var lifetime = this.settings_['lifetime'];
  var damage = this.settings_['damage'];

  for (var i = 0; i < shrapnelCount; ++i) {
    var shrapVel = math.Vector.fromPolar(this.settings_['speed'], i * 2 * Math.PI / shrapnelCount).add(velocity);
    var projectile = this.game_.getModelObjectFactory().newBurst(this.game_, this.owner_, position, shrapVel, lifetime, damage);
    for (var j = 0; j < timeDiff; ++j) {
      projectile.advanceTime();
    }
    this.owner_.addProjectile(projectile);
  }
};
