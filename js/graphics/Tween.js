/**
 * @fileoverview Heads-up display layer
 */

goog.provide('dotprod.graphics.Tween');

goog.require('goog.array');
goog.require('goog.asserts');

/**
 * @constructor
 * @param {!Object} target
 */
dotprod.graphics.Tween = function(target) {
  /**
   * @type {!Object}
   * @private
   */
  this.target_ = target;

  /**
   * @type {!Object}
   * @private
   */
  this.originalProperties_ = {};

  /**
   * @type {!Object}
   * @private
   */
  this.finalProperties_ = {};

  /**
   * @type {number}
   * @private
   */
  this.elapsed_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.duration_ = 0;

  /**
   * @type {function(number, number) : number}
   * @private
   */
  this.easeFunction_ = goog.nullFunction;

  /**
   * @type {boolean}
   * @private
   */
  this.isRegistered_ = false;
};

/**
 * @enum {number}
 */
dotprod.graphics.Tween.Ease = {
  LINEAR: 0
};

/**
 * @type {!Array.<!dotprod.graphics.Tween>}
 * @private
 */
dotprod.graphics.Tween.instances_ = [];

dotprod.graphics.Tween.advanceAll = function() {
  goog.array.forEach(dotprod.graphics.Tween.instances_, function(tween) {
    tween.advance_();
  });

  dotprod.graphics.Tween.instances_ = goog.array.filter(dotprod.graphics.Tween.instances_, function(tween) {
    if (!tween.isActive()) {
      tween.didUnregister_();
      return false;
    }
    return true;
  });
};

/**
 * @param {!Object} properties
 * @param {number} duration
 * @param {dotprod.graphics.Tween.Ease} ease
 */
dotprod.graphics.Tween.prototype.to = function(properties, duration, ease) {
  goog.asserts.assert(duration > 0, 'Duration must be positive.');

  this.duration_ = duration;
  this.elapsed_ = 0;
  this.finalProperties_ = properties;
  this.originalProperties_ = {};
  for (var name in properties) {
    this.originalProperties_[name] = this.target_[name];
  }

  switch (ease) {
    case dotprod.graphics.Tween.Ease.LINEAR:
      this.easeFunction_ = dotprod.graphics.Tween.linearEase_;
      break;

    default:
      goog.asserts.fail('Unknown ease type: ' + ease);
  }
  this.register_();
};

dotprod.graphics.Tween.prototype.advance_ = function() {
  ++this.elapsed_;
  if (this.elapsed_ > this.duration_) {
    return;
  }

  var curvePosition = this.easeFunction_(this.elapsed_, this.duration_);
  for (var name in this.originalProperties_) {
    var delta = this.finalProperties_[name] - this.originalProperties_[name];
    this.target_[name] = delta * curvePosition;
  }
};

dotprod.graphics.Tween.prototype.register_ = function() {
  if (!this.isRegistered_) {
    dotprod.graphics.Tween.instances_.push(this);
  }
  this.isRegistered_ = true;
};

dotprod.graphics.Tween.prototype.didUnregister_ = function() {
  this.isRegistered_ = false;
};

/**
 * @return {boolean}
 * @private
 */
dotprod.graphics.Tween.prototype.isActive_ = function() {
  return this.elapsed_ <= this.duration_;
};

/**
 * @param {number} elapsed
 * @param {number} duration
 * @return {number}
 */
dotprod.graphics.Tween.linearEase_ = function(elapsed, duration) {
  goog.asserts.assert(elapsed >= 0, 'Elapsed time cannot be negative.');
  goog.asserts.assert(duration > 0, 'Duration must be positive.');

  return elapsed / duration;
};
