goog.provide('views.View');

/**
 * @constructor
 * @param {HTMLElement=} opt_rootNode
 */
views.View = function(opt_rootNode) {
  /**
   * @type {HTMLElement}
   */
  this.rootNode_ = opt_rootNode || null;
};

views.View.prototype.renderDom = function(rootNode) {
  this.rootNode_ = rootNode;
};

views.View.prototype.show = function() {
  this.rootNode_.style.display = 'block';
};

views.View.prototype.hide = function() {
  this.rootNode_.style.display = 'none';
};
