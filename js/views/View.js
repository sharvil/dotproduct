/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.View');

/**
 * @constructor
 * @param {HTMLDivElement=} opt_rootNode
 */
dotprod.views.View = function(opt_rootNode) {
  /**
   * @type {HTMLElement}
   */
  this.rootNode_ = opt_rootNode;
};

dotprod.views.View.prototype.renderDom = function(rootNode) {
  this.rootNode_ = rootNode;
};

dotprod.views.View.prototype.show = function() {
  this.rootNode_.style.display = 'block';
};

dotprod.views.View.prototype.hide = function() {
  this.rootNode_.style.display = 'none';
};
