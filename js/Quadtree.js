/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Quadtree');
goog.provide('dotprod.Quadtree.Node');

/**
 * @constructor
 * @param {!Object.<number, number>} mapData
 * @param {number} width
 * @param {number} height
 */
dotprod.Quadtree = function(mapData, width, height) {
  /**
   * @type {!dotprod.Quadtree.Node}
   * @private
   */
  this.rootNode_ = new dotprod.Quadtree.Node(mapData, width, { left: 0, right: width - 1, top: 0, bottom: height - 1 });
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.Quadtree.MIN_SIZE_ = 4;

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.Quadtree.MIN_TILES_ = 16;

/**
 * @param {!Object} viewport
 * @return {!Array.<!Object>}
 */
dotprod.Quadtree.prototype.tilesForViewport = function(viewport) {
  return this.rootNode_.tilesForViewport(viewport);
};

/**
 * @constructor
 * @param {!Object.<number, number>} mapData
 * @param {number} stride
 * @param {!Object} rect
 */
dotprod.Quadtree.Node = function(mapData, stride, rect) {
  /**
   * @type {!Object}
   * @private
   */
  this.rect_ = rect;

  /**
   * @type {!Array.<!dotprod.Quadtree.Node>}
   * @private
   */
  this.children_ = [];

  /**
   * @type {!Array.<!Object>}
   * @private
   */
  this.tiles_ = [];

  /**
   * @type {number}
   * @private
   */
  this.count_ = 0;

  var width = rect.right - rect.left;
  var height = rect.bottom - rect.top;
  if (width > dotprod.Quadtree.MIN_SIZE_ && height > dotprod.Quadtree.MIN_SIZE_) {
    var midX = rect.left + Math.floor(width / 2);
    var midY = rect.top + Math.floor(height / 2);
    this.children_.push(new dotprod.Quadtree.Node(mapData, stride, { left: rect.left, right: midX,       top: rect.top, bottom: midY }));
    this.children_.push(new dotprod.Quadtree.Node(mapData, stride, { left: midX + 1,  right: rect.right, top: rect.top, bottom: midY }));
    this.children_.push(new dotprod.Quadtree.Node(mapData, stride, { left: rect.left, right: midX,       top: midY + 1, bottom: rect.bottom }));
    this.children_.push(new dotprod.Quadtree.Node(mapData, stride, { left: midX + 1,  right: rect.right, top: midY + 1, bottom: rect.bottom }));
    this.merge_();
    this.prune_();
  } else {
    for (var y = rect.top; y <= rect.bottom; ++y) {
      for (var x = rect.left; x <= rect.right; ++x) {
        var tileValue = mapData[y * stride + x];
        if (tileValue) {
          this.tiles_.push({x: x, y: y, tileValue: tileValue});
        }
      }
    }
    this.count_ = this.tiles_.length;
  }
};

/**
 * @param {!Object} viewport
 * @return {!Array.<!Object>}
 */
dotprod.Quadtree.Node.prototype.tilesForViewport = function(viewport) {
  var ret = [];
  if (!this.overlaps_(viewport)) {
    return ret;
  }

  ret = ret.concat(this.tiles_);
  for (var i = 0; i < this.children_.length; ++i) {
    ret = ret.concat(this.children_[i].tilesForViewport(viewport));
  }
  return ret;
};

/**
 * @private
 */
dotprod.Quadtree.Node.prototype.merge_ = function() {
  for (var i = 0; i < this.children_.length; ++i) {
    this.count_ += this.children_[i].count_;
  }

  if (this.count_ <= dotprod.Quadtree.MIN_TILES_) {
    for (var i = 0; i < this.children_.length; ++i) {
      this.tiles_ = this.tiles_.concat(this.children_[i].tiles_);
    }
    this.children_ = [];
  }
};

/**
 * @private
 */
dotprod.Quadtree.Node.prototype.prune_ = function() {
  var prunedChildren = [];
  for (var i = 0; i < this.children_.length; ++i) {
    var child = this.children_[i];
    if (child.count_) {
      prunedChildren.push(child);
    }
  }

  this.children_ = prunedChildren;
};

/**
 * @param {!Object} viewport
 * @return {boolean}
 * @private
 */
dotprod.Quadtree.Node.prototype.overlaps_ = function(viewport) {
  return !(this.rect_.right < viewport.left || this.rect_.bottom < viewport.top || this.rect_.left > viewport.right || this.rect_.top > viewport.bottom);
};
