goog.provide('model.Decoy');

goog.require('goog.asserts');
goog.require('math.Vector');
goog.require('model.Weapon.Type');

/**
 * @constructor
 * @implements {model.Weapon}
 * @param {!Game} game
 * @param {!Object} burstSettings
 * @param {!model.player.Player} owner
 */
model.Decoy = function(game, decoySettings, owner) {
  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = decoySettings;

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
model.Decoy.prototype.getType = function() {
  return model.Weapon.Type.DECOY;
};

/**
 * @return {number}
 */
model.Decoy.prototype.getCount = function() {
  return this.count_;
};

/**
 * @param {!math.Vector} position
 * @param {function(number, number): boolean} commitFireFn
 * @return {Object}
 */
model.Decoy.prototype.fire = function(position, commitFireFn) {
  if (this.count_ <= 0 || !commitFireFn(0 /* fireEnergy */, this.settings_['fireDelay'])) {
    return null;
  }

  --this.count_;
  var lifetime = this.settings_['lifetime'];
  var projectile = this.game_.getModelObjectFactory().newDecoy(this.game_, this.owner_, this.owner_.getPosition(), this.owner_.getVelocity(), lifetime);
  this.owner_.addProjectile(projectile);

  return {
    'type': this.getType()
  };
};

/**
 * @override
 */
model.Decoy.prototype.onFired = function(timeDiff, position, velocity, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire decoy with incorrect weapon type: ' + weaponData['type']);

  var lifetime = this.settings_['lifetime'];

  var projectile = this.game_.getModelObjectFactory().newDecoy(this.game_, this.owner_, this.owner_.getPosition(), this.owner_.getVelocity(), lifetime);
  this.owner_.addProjectile(projectile);

  for (var i = 0 ; i < timeDiff; ++i) {
    projectile.advanceTime();
  }
};
