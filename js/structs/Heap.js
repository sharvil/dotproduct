/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.structs.Heap');

goog.require('goog.array');
goog.require('goog.asserts');

/**
 * @constructor
 * @param {function(*, *) : number} comparator
 */
dotprod.structs.Heap = function(comparator) {
  /**
   * @type {function(*, *) : number}
   * @private
   */
   this.compare_ = comparator;

  /**
   * @type {!goog.array.ArrayLike}
   * @private
   */
  this.heap_ = [];
};

/**
 * @param {goog.array.ArrayLike} array
 * @param {function(*, *) : number} comparator
 * @return {!dotprod.structs.Heap}
 */
dotprod.structs.Heap.fromArray = function(array, comparator) {
  var heap = new dotprod.structs.Heap(comparator);
  heap.heap_ = array;
  heap.heapify_();
  return heap;
};

/**
 * @return {*}
 */
dotprod.structs.Heap.prototype.peek = function() {
  goog.asserts.assert(!this.isEmpty(), 'Cannot peek at an empty heap.');
  return this.heap_[0];
};

/**
 * @return {*}
 */
dotprod.structs.Heap.prototype.pop = function() {
  goog.asserts.assert(!this.isEmpty(), 'Cannot pop from an empty heap.');
  var ret = this.heap_[0];
  if (this.getCount() == 1) {
    goog.array.clear(this.heap_);
  } else {
    this.heap_[0] = this.heap_.pop();
    this.floatDown_(0);
  }
  return ret;
};

/**
 * @param {*} value
 */
dotprod.structs.Heap.prototype.insert = function(value) {
  this.heap_.push(value);
  this.bubbleUp_(this.getCount() - 1);
};

/**
 * @param {*} value
 */
dotprod.structs.Heap.prototype.remove = function(value) {
  var nodes = this.heap_;
  var count = this.getCount();
  for (var i = 0; i < count; ++i) {
    if (value == nodes[i]) {
      nodes[i] = nodes.pop();
      this.floatDown_(i);
      return;
    }
  }
};

dotprod.structs.Heap.prototype.clear = function() {
  goog.array.clear(this.heap_);
};

/**
 * @return {number}
 */
dotprod.structs.Heap.prototype.getCount = function() {
  return this.heap_.length;
};

/**
 * @return {boolean}
 */
dotprod.structs.Heap.prototype.isEmpty = function() {
  return goog.array.isEmpty(this.heap_);
};

/**
 * @private
 */
dotprod.structs.Heap.prototype.heapify_ = function() {
  for (var index = (this.getCount() >> 1) - 1; index >= 0; --index) {
    this.floatDown_(index);
  }
};

/**
 * @param {number} index
 * @private
 */
dotprod.structs.Heap.prototype.floatDown_ = function(index) {
  var nodes = this.heap_;
  var count = this.getCount();
  var node = nodes[index];
  while (index < (count >> 1)) {
    var left = this.leftChild_(index);
    var right = this.rightChild_(index);

    var smallerChild = left;
    if (right < count && this.compare_(nodes[left], nodes[right]) > 0) {
      smallerChild = right;
    }

    if (this.compare_(node, nodes[smallerChild]) <= 0) {
      break;
    }

    nodes[index] = nodes[smallerChild];
    index = smallerChild;
  }
  nodes[index] = node;
};

/**
 * @param {number} index
 * @private
 */
dotprod.structs.Heap.prototype.bubbleUp_ = function(index) {
  var nodes = this.heap_;
  var node = nodes[index];
  while (index > 0) {
    var parent = this.parent_(index);
    if (this.compare_(node, nodes[parent]) >= 0) {
      break;
    }
    nodes[index] = nodes[parent];
    index = parent;
  }
  nodes[index] = node;
};

/**
 * @param {number} index
 * @return {number}
 * @private
 */
dotprod.structs.Heap.prototype.leftChild_ = function(index) {
  return 2 * index + 1;
};

/**
 * @param {number} index
 * @return {number}
 * @private
 */
dotprod.structs.Heap.prototype.rightChild_ = function(index) {
  return 2 * index + 2;
};

/**
 * @param {number} index
 * @return {number}
 * @private
 */
dotprod.structs.Heap.prototype.parent_ = function(index) {
  // Use >> opreator so we get an implicit floor().
  return (index - 1) >> 1;
};
