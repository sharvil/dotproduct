goog.provide('model.Simulation');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('model.ModelObject');
goog.require('time.Timer');

/**
 * @constructor
 * @param {!model.ModelObjectFactory} modelObjectFactory
 */
model.Simulation = function(modelObjectFactory) {
  /**
   * @type {!model.ModelObjectFactory}
   * @private
   */
  this.modelObjectFactory_ = modelObjectFactory;

  /**
   * @type {!Array.<!model.ModelObject>}
   * @private
   */
  this.registeredObjects_ = [];

  /**
   * @type {number}
   * @private
   */
  this.timeMillis_ = 0;
};

/**
 * @param {!model.ModelObject} obj
 */
model.Simulation.prototype.registerObject = function(obj) {
  goog.asserts.assert(obj.isValid(), 'Cannot register an invalid object.');
  goog.array.extend(this.registeredObjects_, obj);
};

/**
 * @param {!model.ModelObject} obj
 */
model.Simulation.prototype.unregisterObject = function(obj) {
  goog.array.remove(this.registeredObjects_, obj);
};

model.Simulation.prototype.advanceTime = function() {
  // Start counting time from the first tick of the simulation instead of
  // when this object was constructed. Doing it this way makes sure we don't
  // have a clock bias due to the delay from object construction -> first tick.
  if (!this.timeMillis_) {
    this.timeMillis_ = goog.now();
  } else {
    this.timeMillis_ += time.Timer.ticksToMillis(1);
  }

  /** @type {!Array.<!model.ModelObject>} */
  var objectSnapshot = goog.array.clone(this.registeredObjects_);
  goog.array.forEach(objectSnapshot, function(obj) {
    obj.advanceTime();
  });
};

/**
 * @return {number}
 */
model.Simulation.prototype.getTimeMillis = function() {
  return this.timeMillis_;
};
