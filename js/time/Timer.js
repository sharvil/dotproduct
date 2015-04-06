goog.provide('time.Timer');

/**
 * @constructor
 */
time.Timer = function() {
  /**
   * @type {number|null}
   * @private
   */
  this.timeoutId_ = null;

  /**
   * @type {number|null}
   * @private
   */
  this.intervalId_ = null;
};

/**
 * @type {number}
 * @private
 * @const
 */
time.Timer.TICK_PERIOD_ = 10;

/**
 * @param {function()} callback
 * @param {number} timeout_ticks
 */
time.Timer.prototype.setTimeout = function(callback, timeout_ticks) {
  this.clear();
  this.timeoutId_ = setTimeout(callback, timeout_ticks * time.Timer.TICK_PERIOD_);
};

/**
 * @param {function()} callback
 * @param {number} interval_ticks
 */
time.Timer.prototype.setInterval = function(callback, interval_ticks) {
  this.clear();
  this.intervalId_ = setInterval(callback, interval_ticks * time.Timer.TICK_PERIOD_);
};

time.Timer.prototype.clear = function() {
  if (this.timeoutId_ != null) {
    clearTimeout(this.timeoutId_);
    this.timeoutId_ = null;
  }

  if (this.intervalId_ != null) {
    clearInterval(this.intervalId_);
    this.intervalId_ = null;
  }
};

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
