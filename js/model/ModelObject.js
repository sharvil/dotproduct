/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('model.ModelObject');

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
  if (!this.isValid_) {
    return;
  }
  this.isValid_ = false;
  this.simulation_.unregisterObject(this);
  this.onInvalidate_();
};

/**
 * @protected
 */
model.ModelObject.prototype.onInvalidate_ = goog.nullFunction;
