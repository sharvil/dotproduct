goog.provide('views.DisconnectedView');

goog.require('goog.dom');
goog.require('goog.events');

/**
 * @constructor
 */
views.DisconnectedView = function() {
  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.getElement('dcv'));

  goog.events.listen(this.view_, goog.events.EventType.CLICK, this.onClick_.bind(this));
};

views.DisconnectedView.prototype.show = function() {
  this.view_.style.display = 'block';
};

views.DisconnectedView.prototype.hide = function() {
  this.view_.style.display = 'none';
};

views.DisconnectedView.prototype.onClick_ = function() {
  window.location.reload();
};
