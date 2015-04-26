goog.provide('input.Mouse');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('math.Vector');
goog.require('time.Timer');

/**
 * @constructor
 */
input.Mouse = function() {
  /**
   * @type {!math.Vector}
   * @private
   */
  this.position_ = math.Vector.ZERO;

  /**
   * @type {!time.Timer}
   * @private
   */
  this.timeout_ = new time.Timer();
  this.timeout_.setTimeout(this.onIdle_.bind(this), input.Mouse.IDLE_TIMEOUT_TICKS_);

  goog.events.listen(window, goog.events.EventType.MOUSEMOVE, this.onMotion_.bind(this));
};

/**
 * @type {number}
 * @private
 * @const
 */
input.Mouse.IDLE_TIMEOUT_TICKS_ = 300;

/**
 * @param {!math.Rect} rect
 * @return {boolean} True if the mouse cursor is hovering over the given rect, false otherwise.
 */
input.Mouse.prototype.isHovering = function(rect) {
  return this.position_ == math.Vector.ZERO ? false : rect.contains(this.position_);
};

/**
 * @param {Event} event
 * @private
 */
input.Mouse.prototype.onMotion_ = function(event) {
  document.body.style.cursor = '';
  this.position_ = new math.Vector(event.offsetX, event.offsetY);
  this.timeout_.setTimeout(this.onIdle_.bind(this), input.Mouse.IDLE_TIMEOUT_TICKS_);
};

/**
 * @private
 */
input.Mouse.prototype.onIdle_ = function() {
  this.position_ = math.Vector.ZERO;
  document.body.style.cursor = 'none';
};
