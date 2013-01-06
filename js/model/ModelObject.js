/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.ModelObject');

/**
 * @constructor
 * @param {!dotprod.model.Simulation} simulation
 */
dotprod.model.ModelObject = function(simulation) {
  /**
   * @type {!dotprod.model.Simulation}
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

dotprod.model.ModelObject.prototype.advanceTime = goog.abstractMethod;

/**
 * @return {boolean} Returns true if the object is still valid, false otherwise.
 */
dotprod.model.ModelObject.prototype.isValid = function() {
  return this.isValid_;
};

dotprod.model.ModelObject.prototype.invalidate = function() {
  this.isValid_ = false;
  this.simulation_.unregisterObject(this);
};
