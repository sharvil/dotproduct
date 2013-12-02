goog.provide('Timer');

/**
 * @type {number}
 * @private
 * @const
 */
Timer.TICK_PERIOD_ = 10;

/**
 * @param {function()} cb
 * @param {number} timeout
 * @return {number}
 */
Timer.setInterval = function(cb, timeout) {
  return window.setInterval(cb, timeout * Timer.TICK_PERIOD_);
};

/**
 * @param {number} intervalTimer
 */
Timer.clearInterval = function(intervalTimer) {
  window.clearInterval(intervalTimer);
};

/**
 * @param {number} millis
 * @return {number}
 */
Timer.millisToTicks = function(millis) {
  return Math.floor(millis / Timer.TICK_PERIOD_);
};

/**
 * @param {number} ticks
 * @return {number}
 */
Timer.ticksToMillis = function(ticks) {
  return ticks * Timer.TICK_PERIOD_;
};
