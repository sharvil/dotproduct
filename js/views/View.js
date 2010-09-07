/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.View');

/**
 * @constructor
 */
dotprod.views.View = function() {
  /**
   * @type {HTMLElement}
   */
  this.rootNode_;
};

dotprod.views.View.prototype.renderDom = function(rootNode) {
  this.rootNode_ = rootNode;
};

dotprod.views.View.prototype.dispose = function() {
  while (this.rootNode_.childNodes.length) {
    this.rootNode_.removeChild(this.rootNode_.firstChild);
  }
};

dotprod.views.View.prototype.show = function() {
  this.rootNode_.style.display = '';
};

dotprod.views.View.prototype.hide = function() {
  this.rootNode_.style.display = 'none';
};
