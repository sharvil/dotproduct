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
  goog.array.forEach(this.effects_, function(effect) {
    if (effect.isAlive()) {
      cb(effect);
    }
  });
};
