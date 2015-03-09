goog.provide('time.Timer');

/**
 * @type {number}
 * @private
 * @const
 */
time.Timer.TICK_PERIOD_ = 10;

/**
 * @param {function()} cb
 * @param {number} timeout
 * @return {number}
 */
time.Timer.setInterval = function(cb, timeout) {
  return window.setInterval(cb, timeout * time.Timer.TICK_PERIOD_);
};

/**
 * @param {number} intervalTimer
 */
time.Timer.clearInterval = function(intervalTimer) {
  window.clearInterval(intervalTimer);
};

/**
 * @param {number} millis
 * @return {number}
 */
time.Timer.millisToTicks = function(millis) {
  return Math.floor(millis / time.Timer.TICK_PERIOD_);
};

/**
 * @param {number} ticks
 * @return {number}
 */
time.Timer.ticksToMillis = function(ticks) {
  return ticks * time.Timer.TICK_PERIOD_;
};
