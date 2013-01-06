/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.EffectIndex');

goog.require('goog.array');
goog.require('dotprod.entities.Effect');

/**
 * @constructor
 */
dotprod.EffectIndex = function() {
  /**
   * @type {!Array.<!dotprod.entities.Effect>}
   * @private
   */
  this.effects_ = [];
};

/**
 * @param {!dotprod.entities.Effect} effect
 */
dotprod.EffectIndex.prototype.addEffect = function(effect) {
  this.effects_.push(effect);
};

/**
 * @param {function(!dotprod.entities.Effect)} cb
 */
dotprod.EffectIndex.prototype.forEach = function(cb) {
  this.effects_ = goog.array.filter(this.effects_, function(effect) { return effect.isValid(); });
  goog.array.forEach(this.effects_, cb);
};
