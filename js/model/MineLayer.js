goog.provide('model.MineLayer');

goog.require('goog.asserts');
goog.require('math.Range');
goog.require('model.Weapon.Type');

/**
 * @constructor
 * @implements model.Weapon
 * @param {!Game} game
 * @param {!Object} bombBaySettings
 * @param {!model.player.Player} owner
 */
model.MineLayer = function(game, bombBaySettings, owner) {
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
model.MineLayer.prototype.getType = function() {
  return model.Weapon.Type.MINE;
};

/**
 * @return {number}
 */
model.MineLayer.prototype.getLevel = function() {
  return this.level_.getValue();
};

model.MineLayer.prototype.upgrade = function() {
  this.level_.increment();
};

/**
 * @param {!math.Vector} position
 * @param {function(number, number): boolean} commitFireFn
 * @return {Object}
 */
model.MineLayer.prototype.fire = function(position, commitFireFn) {
  var level = this.level_.getValue();
  if(level < 0) {
    return null;
  }

  var fireEnergy = this.getFireEnergy_();
  var fireDelay = this.getFireDelay_();

  if (!commitFireFn(fireEnergy, fireDelay)) {
    return null;
  }

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var projectile = this.game_.getModelObjectFactory().newMine(this.game_, this.owner_, level, position, lifetime, damage);

  this.owner_.addProjectile(projectile);
  this.game_.getResourceManager().playSound('mine' + level);

  return {
    'type': this.getType(),
    'level': level,
    'pos': position.toArray()
  };
};

/**
 * @override
 */
model.MineLayer.prototype.onFired = function(timeDiff, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire mine with incorrect weapon type: ' + weaponData['type']);

  var level = weaponData['level'];
  var position = math.Vector.fromArray(weaponData['pos']);

  // Make sure the level is correct so the following getters use the right value for their calculations.
  this.level_.setValue(level);

  var projectile = this.game_.getModelObjectFactory().newMine(this.game_, this.owner_, this.level_.getValue(), position, this.getLifetime_(), this.getDamage_());
  for (var i = 0; i < timeDiff; ++i) {
    projectile.advanceTime();
  }
  this.owner_.addProjectile(projectile);
};

/**
 * @return {number}
 * @private
 */
model.MineLayer.prototype.getFireDelay_ = function() {
  return this.bombBaySettings_['fireDelay'];
};

/**
 * @return {number}
 * @private
 */
model.MineLayer.prototype.getFireEnergy_ = function() {
  return this.bombBaySettings_['fireEnergy'];
};

/**
 * @return {number}
 * @private
 */
model.MineLayer.prototype.getLifetime_ = function() {
  return this.bombBaySettings_['lifetime'];
};

/**
 * @return {number}
 * @private
 */
model.MineLayer.prototype.getDamage_ = function() {
  return this.bombBaySettings_['damage'] + this.level_.getValue() * this.bombBaySettings_['damageUpgrade'];
};
