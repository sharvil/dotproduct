/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Timer');

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.Timer.TICK_PERIOD_ = 10;

/**
 * @param {function()} cb
 * @param {number} timeout
 * @return {number}
 */
dotprod.Timer.setInterval = function(cb, timeout) {
  return window.setInterval(cb, timeout * dotprod.Timer.TICK_PERIOD_);
};

/**
 * @param {number} intervalTimer
 */
dotprod.Timer.clearInterval = function(intervalTimer) {
  window.clearInterval(intervalTimer);
};

/**
 * @return {number}
 */
dotprod.Timer.millisToTicks = function(millis) {
  return millis / dotprod.Timer.TICK_PERIOD_;
};

/**
 * @return {number}
 */
dotprod.Timer.ticksToMillis = function(ticks) {
  return ticks * dotprod.Timer.TICK_PERIOD_;
};
