goog.provide('model.Repel');

goog.require('goog.asserts');
goog.require('model.Weapon.Type');

/**
 * @constructor
 * @param {!Game} game
 * @param {!Object} repelSettings
 * @param {!model.player.Player} owner
 * @implements {model.Weapon}
 */
model.Repel = function(game, repelSettings, owner) {
  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = repelSettings;

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
model.Repel.prototype.getType = function() {
  return model.Weapon.Type.REPEL;
};

/**
 * @return {number}
 */
model.Repel.prototype.getCount = function() {
  return this.count_;
};

/**
 * @param {!math.Vector} position
 * @param {function(number, number): boolean} commitFireFn
 * @return {Object}
 */
model.Repel.prototype.fire = function(position, commitFireFn) {
  if (this.count_ <= 0 || !commitFireFn(0 /* fireEnergy */, this.settings_['fireDelay'])) {
    return null;
  }

  --this.count_;

  var lifetime = this.settings_['lifetime'];
  var distance = this.settings_['distance'];
  var speed = this.settings_['speed'];

  var projectile = this.game_.getModelObjectFactory().newRepel(this.game_, this.owner_, this.owner_.getPosition(), lifetime, distance, speed);
  this.owner_.addProjectile(projectile);

  this.game_.getResourceManager().playSound('repel');

  return {
    'type': this.getType()
  };
};

/**
 * @override
 */
model.Repel.prototype.onFired = function(timeDiff, position, velocity, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire repel with incorrect weapon type: ' + weaponData['type']);

  var lifetime = this.settings_['lifetime'];
  var distance = this.settings_['distance'];
  var speed = this.settings_['speed'];

  var projectile = this.game_.getModelObjectFactory().newRepel(this.game_, this.owner_, position, lifetime, distance, speed);
  this.owner_.addProjectile(projectile);

  for (var i = 0; i < timeDiff; ++i) {
    projectile.advanceTime();
  }
};
