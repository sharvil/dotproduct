

import goog.array from 'goog.array';
import goog.asserts from 'goog.asserts';

/**
 * @constructor
 * @param {function(*, *) : number} comparator
 */
structs.Heap = function(comparator) {
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
 * @return {!structs.Heap}
 */
structs.Heap.fromArray = function(array, comparator) {
  let heap = new structs.Heap(comparator);
  heap.heap_ = array;
  heap.heapify_();
  return heap;
};

/**
 * @return {*}
 */
structs.Heap.prototype.peek = function() {
  goog.asserts.assert(!this.isEmpty(), 'Cannot peek at an empty heap.');
  return this.heap_[0];
};

/**
 * @return {*}
 */
structs.Heap.prototype.pop = function() {
  goog.asserts.assert(!this.isEmpty(), 'Cannot pop from an empty heap.');
  let ret = this.heap_[0];
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
structs.Heap.prototype.insert = function(value) {
  this.heap_.push(value);
  this.bubbleUp_(this.getCount() - 1);
};

/**
 * @param {*} value
 */
structs.Heap.prototype.remove = function(value) {
  let nodes = this.heap_;
  let count = this.getCount();
  for (let i = 0; i < count; ++i) {
    if (value == nodes[i]) {
      nodes[i] = nodes.pop();
      this.floatDown_(i);
      return;
    }
  }
};

structs.Heap.prototype.clear = function() {
  goog.array.clear(this.heap_);
};

/**
 * @return {number}
 */
structs.Heap.prototype.getCount = function() {
  return this.heap_.length;
};

/**
 * @return {boolean}
 */
structs.Heap.prototype.isEmpty = function() {
  return goog.array.isEmpty(this.heap_);
};

/**
 * @private
 */
structs.Heap.prototype.heapify_ = function() {
  for (let index = (this.getCount() >> 1) - 1; index >= 0; --index) {
    this.floatDown_(index);
  }
};

/**
 * @param {number} index
 * @private
 */
structs.Heap.prototype.floatDown_ = function(index) {
  let nodes = this.heap_;
  let count = this.getCount();
  let node = nodes[index];
  while (index < (count >> 1)) {
    let left = this.leftChild_(index);
    let right = this.rightChild_(index);

    let smallerChild = left;
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
structs.Heap.prototype.bubbleUp_ = function(index) {
  let nodes = this.heap_;
  let node = nodes[index];
  while (index > 0) {
    let parent = this.parent_(index);
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
structs.Heap.prototype.leftChild_ = function(index) {
  return 2 * index + 1;
};

/**
 * @param {number} index
 * @return {number}
 * @private
 */
structs.Heap.prototype.rightChild_ = function(index) {
  return 2 * index + 2;
};

/**
 * @param {number} index
 * @return {number}
 * @private
 */
structs.Heap.prototype.parent_ = function(index) {
  // Use >> opreator so we get an implicit floor().
  return (index - 1) >> 1;
};
