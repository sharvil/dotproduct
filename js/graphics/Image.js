/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('graphics.Image');

/**
 * @constructor
 * @param {number=} opt_tilesPerRow
 * @param {number=} opt_tilesPerCol
 */
graphics.Image = function(opt_tilesPerRow, opt_tilesPerCol) {
  /**
   * @type {!HTMLImageElement}
   * @private
   */
  this.node_ = /** @type {!HTMLImageElement} */ (goog.dom.createElement('img'));

  /**
   * @type {number}
   * @private
   * @const
   */
  this.tilesPerRow_ = opt_tilesPerRow || 1;

  /**
   * @type {number}
   * @private
   * @const
   */
  this.tilesPerCol_ = opt_tilesPerCol || 1;
};

/**
 * @return {boolean} True if the image has been loaded, false otherwise.
 */
graphics.Image.prototype.isLoaded = function() {
  return !!this.node_.src && this.node_.complete;
};

/**
 * @param {string} resourceName
 * @param {function(string)=} opt_loadCb
 */
graphics.Image.prototype.load = function(resourceName, opt_loadCb) {
  this.node_.src = resourceName;
  if (opt_loadCb) {
    goog.events.listen(this.node_, 'load', goog.bind(opt_loadCb, new String(resourceName)));
  }
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number=} opt_tileNum
 */
graphics.Image.prototype.render = function(context, x, y, opt_tileNum) {
  if (!this.isLoaded()) {
    return;
  }

  if (opt_tileNum === undefined) {
    context.save();
      context.drawImage(this.node_, x, y, this.node_.width, this.node_.height);
    context.restore();
  } else {
    var numTiles = this.tilesPerRow_ * this.tilesPerCol_;

    if (opt_tileNum < 0 || opt_tileNum >= numTiles || !this.isLoaded()) {
      return;
    }

    var tileWidth = this.getTileWidth();
    var tileHeight = this.getTileHeight();

    var row = Math.floor(opt_tileNum / this.tilesPerRow_);
    var column = opt_tileNum % this.tilesPerRow_;

    context.save();
      context.drawImage(this.node_,
                        column * tileWidth,
                        row * tileHeight,
                        tileWidth,
                        tileHeight,
                        x, y,
                        tileWidth,
                        tileHeight);
    context.restore();
  }
};

/**
 * @return {number}
 */
graphics.Image.prototype.getNumTiles = function() {
  return this.tilesPerRow_ * this.tilesPerCol_;
};

/**
 * @return {number}
 */
graphics.Image.prototype.getTileWidth = function() {
  return Math.floor(this.node_.width / this.tilesPerRow_);
};

/**
 * @return {number}
 */
graphics.Image.prototype.getTileHeight = function() {
  return Math.floor(this.node_.height / this.tilesPerCol_);
};
