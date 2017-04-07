

import goog.asserts from 'goog.asserts';
import goog.log.Logger from 'goog.log.Logger';

/**
 * @constructor
 * @param {number} rate
 */
time.SamplingTimer = function(rate) {
  rate = Math.floor(rate);
  goog.asserts.assert(rate > 0, 'Sampling rate must be > 0.');

  /**
   * @type {goog.log.Logger}
   * @private
   */
  this.logger_ = goog.log.getLogger('time.SamplingTimer');

  /**
   * @type {number}
   * @private
   */
  this.sampleRate_ = rate;

  /**
   * @type {!Object.<string, !Object>}
   * @private
   */
  this.timers_ = {};
};

/**
 * @param {string} name
 */
time.SamplingTimer.prototype.start = function(name) {
  var timer = this.timers_[name];
  if (!timer) {
    timer = { start: 0, sample: 0 };
  }

  if (++timer.sample == this.sampleRate_) {
    timer.sample = 0;
    timer.start = goog.now();
  }

  this.timers_[name] = timer;
};

/**
 * @param {string} name
 */
time.SamplingTimer.prototype.end = function(name) {
  var timer = this.timers_[name];
  goog.asserts.assert(timer, 'No timer found matching name: ' + name);

  if (timer.start) {
    goog.log.info(this.logger_, '{' + name + '}: ' + (goog.now() - timer.start) + 'ms');
    delete this.timers_[name];
  }
};
