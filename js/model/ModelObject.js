goog.provide('model.ModelObject');

goog.require('goog.asserts');

/**
 * @constructor
 * @param {!model.Simulation} simulation
 */
model.ModelObject = function(simulation) {
  /**
   * @type {!model.Simulation}
   * @protected
   */
  this.simulation_ = simulation;

  /**
   * @type {boolean}
   * @private
   */
  this.isValid_ = true;

  this.simulation_.registerObject(this);
};

model.ModelObject.prototype.advanceTime = goog.abstractMethod;

/**
 * @return {boolean} Returns true if the object is still valid, false otherwise.
 */
model.ModelObject.prototype.isValid = function() {
  return this.isValid_;
};

model.ModelObject.prototype.invalidate = function() {
  goog.asserts.assert(this.isValid_, 'Duplicate invalidation of model object.');

  this.isValid_ = false;
  this.simulation_.unregisterObject(this);
  this.onInvalidate_();
};

/**
 * @protected
 */
model.ModelObject.prototype.onInvalidate_ = goog.nullFunction;
