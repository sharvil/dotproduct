goog.provide('structs.Quadtree');
goog.provide('structs.Quadtree.Node');

goog.require('math.Rect');

/**
 * @constructor
 * @param {!Object.<number, number>} mapData
 * @param {number} width
 * @param {number} height
 */
structs.Quadtree = function(mapData, width, height) {
  /**
   * @type {!structs.Quadtree.Node}
   * @private
   */
  this.rootNode_ = new structs.Quadtree.Node(mapData, width, new math.Rect(0, 0, width, height));
};

/**
 * @type {number}
 * @private
 * @const
 */
structs.Quadtree.MIN_SIZE_ = 4;

/**
 * @type {number}
 * @private
 * @const
 */
structs.Quadtree.MIN_TILES_ = 16;

/**
 * @param {!math.Rect} viewport
 * @return {!Array.<!Object>}
 */
structs.Quadtree.prototype.tilesForViewport = function(viewport) {
  return this.rootNode_.tilesForViewport(viewport);
};

/**
 * @constructor
 * @param {!Object.<number, number>} mapData
 * @param {number} stride
 * @param {!math.Rect} rect
 */
structs.Quadtree.Node = function(mapData, stride, rect) {
  /**
   * @type {!math.Rect}
   * @private
   */
  this.rect_ = rect;

  /**
   * @type {!Array.<!structs.Quadtree.Node>}
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

  var width = rect.width();
  var height = rect.height();
  if (width > structs.Quadtree.MIN_SIZE_ && height > structs.Quadtree.MIN_SIZE_) {
    var midX = rect.left() + Math.floor(width / 2);
    var midY = rect.top() + Math.floor(height / 2);
    this.children_.push(new structs.Quadtree.Node(mapData, stride, math.Rect.fromBox(rect.left(), rect.top(), midX,         midY)));
    this.children_.push(new structs.Quadtree.Node(mapData, stride, math.Rect.fromBox(midX + 1,    rect.top(), rect.right(), midY)));
    this.children_.push(new structs.Quadtree.Node(mapData, stride, math.Rect.fromBox(rect.left(), midY + 1,   midX,         rect.bottom())));
    this.children_.push(new structs.Quadtree.Node(mapData, stride, math.Rect.fromBox(midX + 1,    midY + 1,   rect.right(), rect.bottom())));
    this.merge_();
    this.prune_();
  } else {
    for (var y = rect.top(); y <= rect.bottom(); ++y) {
      for (var x = rect.left(); x <= rect.right(); ++x) {
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
 * @param {!math.Rect} viewport
 * @return {!Array.<!Object>}
 */
structs.Quadtree.Node.prototype.tilesForViewport = function(viewport) {
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
structs.Quadtree.Node.prototype.merge_ = function() {
  for (var i = 0; i < this.children_.length; ++i) {
    this.count_ += this.children_[i].count_;
  }

  if (this.count_ <= structs.Quadtree.MIN_TILES_) {
    for (var i = 0; i < this.children_.length; ++i) {
      this.tiles_ = this.tiles_.concat(this.children_[i].tiles_);
    }
    this.children_ = [];
  }
};

/**
 * @private
 */
structs.Quadtree.Node.prototype.prune_ = function() {
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
 * @param {!math.Rect} viewport
 * @return {boolean}
 * @private
 */
structs.Quadtree.Node.prototype.overlaps_ = function(viewport) {
  return !(this.rect_.right() < viewport.left() || this.rect_.bottom() < viewport.top() || this.rect_.left() > viewport.right() || this.rect_.top() > viewport.bottom());
};
