/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.EffectLayer');

goog.require('goog.array');
goog.require('dotprod.Camera');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.EffectIndex');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.EffectIndex} effectIndex
 */
dotprod.layers.EffectLayer = function(effectIndex) {
  /**
   * @type {!dotprod.EffectIndex}
   * @private
   */
  this.effectIndex_ = effectIndex;
};

/**
 * @deprecated
 * @override
 */
dotprod.layers.EffectLayer.prototype.update = goog.nullFunction;

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.EffectLayer.prototype.render = function(camera) {
  this.effectIndex_.forEach(function(effect) {
    effect.render(camera);
  });
};
