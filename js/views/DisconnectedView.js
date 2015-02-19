goog.provide('views.DisconnectedView');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('views.View');

/**
 * @constructor
 * @extends {views.View}
 */
views.DisconnectedView = function() {
  goog.base(this);

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.view_.classList.add(views.DisconnectedView.DISCONNECTED_VIEW_CLASS_NAME_);
  this.hide();

  goog.events.listen(this.view_, goog.events.EventType.CLICK, goog.bind(this.onClick_, this));
};
goog.inherits(views.DisconnectedView, views.View);

/**
 * @type {string}
 * @private
 * @const
 */
views.DisconnectedView.DISCONNECTED_VIEW_CLASS_NAME_ = 'dcv';

/**
 * @param {!HTMLDivElement} rootNode
 * @override
 */
views.DisconnectedView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);
  this.view_.innerHTML = '<center><p>Oops, you got disconnected...</p><p>Click here to get back in the game.</p></center>';
  rootNode.appendChild(this.view_);
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
