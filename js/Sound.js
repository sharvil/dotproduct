goog.provide('Sound');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventType');

/**
 * @constructor
 */
Sound = function() {
  /**
   * @type {Object}
   * @private
   */
  this.buffer_ = null;
};

/**
 * @type {!Object}
 * @private
 */
Sound.audioContext_ = new AudioContext();

/**
 * @param {string} url
 * @param {function()} loadCb
 */
Sound.prototype.load = function(url, loadCb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  goog.events.listen(xhr, goog.events.EventType.LOAD, this.onLoad_.bind(this, loadCb));
  xhr.send();
};

Sound.prototype.play = function() {
  goog.asserts.assert(!!this.buffer_, 'Unable to play sound before it\'s loaded.');

  var source = Sound.audioContext_.createBufferSource();
  source.buffer = this.buffer_;
  source.connect(Sound.audioContext_.destination);
  source.start();
};

/**
 * @param {function()} loadCb
 * @param {!Object} event
 * @private
 */
Sound.prototype.onLoad_ = function(loadCb, event) {
  var self = this;
  Sound.audioContext_.decodeAudioData(event.target.response, function(buffer) {
    self.buffer_ = buffer;
    loadCb();
  });
};
