goog.provide('Listener');

goog.require('goog.array');
goog.require('goog.asserts');

/**
 * Listener is a mixin-only class that should be mixed in to a class' prototype
 * object like so:
 *
 * Foo = function() {
 * };
 * goog.mixin(Foo.prototype, Listener.prototype);
 *
 * @constructor
 */
Listener = function() {
  goog.asserts.assert(false, 'Listener should never be instantiated.');
};

/**
 * @param {string} event
 * @param {function(!Listener)} callback
 */
Listener.prototype.addListener = function(event, callback) {
  if (!this.listener__listeners_) {
    this.listener__listeners_ = {};
  }

  if (!this.listener__listeners_[event]) {
    this.listener__listeners_[event] = [];
  }

  this.listener__listeners_[event].push(callback);
};

/**
 * @param {string} event
 * @param {function(!Listener)} callback
 */
Listener.prototype.removeListener = function(event, callback) {
  if (!this.listener__listeners_) {
    this.listener__listeners_ = {};
  }

  if (this.listener__listeners_[event]) {
    goog.array.remove(this.listener__listeners_[event], callback);
  }
};

/**
 * @param {string} event
 * @param {Object=} opt_object
 * @protected
 */
Listener.prototype.fireEvent_ = function(event, opt_object) {
  if (!this.listener__listeners_ || !this.listener__listeners_[event]) {
    return;
  }

  for (var i = 0; i < this.listener__listeners_[event].length; ++i) {
    this.listener__listeners_[event][i](this, opt_object);
  }
};
