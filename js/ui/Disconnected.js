goog.provide('ui.Disconnected');

goog.require('goog.dom');
goog.require('goog.events');

/**
 * @constructor
 */
ui.Disconnected = function() {
  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.getElement('dcv'));

  goog.events.listen(this.view_, goog.events.EventType.CLICK, this.onClick_.bind(this));
};

ui.Disconnected.prototype.show = function() {
  this.view_.style.display = 'block';
};

ui.Disconnected.prototype.hide = function() {
  this.view_.style.display = 'none';
};

ui.Disconnected.prototype.onClick_ = function() {
  window.location.reload();
};
