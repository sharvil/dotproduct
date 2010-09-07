/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Image');
goog.provide('dotprod.TiledImage');

/**
 * @constructor
 */
dotprod.Image = function() {
  /**
   * @type {!HTMLImageElement}
   * @private
   */
  this.node_ = /** @type {!HTMLImageElement} */ (goog.dom.createElement('img'));
};

/**
 * @return {boolean} True if the image has been loaded, false otherwise.
 */
dotprod.Image.prototype.isLoaded = function() {
  return !!this.node_.src && this.node_.complete;
};

/**
 * @param {string} resourceName
 * @param {function(string)=} opt_loadCb
 */
dotprod.Image.prototype.load = function(resourceName, opt_loadCb) {
  this.node_.src = resourceName;
  if (opt_loadCb) {
    goog.events.listen(this.node_, 'load', goog.bind(opt_loadCb, resourceName));
  }
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 */
dotprod.Image.prototype.render = function(context, x, y) {
  if (!this.isLoaded()) {
    return;
  }

  context.save();
    context.drawImage(this.node_, x, y, this.node_.width, this.node_.height);
  context.restore();
};

/**
 * @constructor
 * @extends dotprod.Image
 * @param {number} tilesPerRow
 * @param {number} tilesPerCol
 */
dotprod.TiledImage = function(tilesPerRow, tilesPerCol) {
  dotprod.Image.call(this);

  /**
   * @const
   * @type {number}
   * @private
   */
  this.tilesPerRow_ = tilesPerRow;

  /**
   * @const
   * @type {number}
   * @private
   */
  this.tilesPerCol_ = tilesPerCol;
};
goog.inherits(dotprod.TiledImage, dotprod.Image);

/**
 * @return {number}
 */
dotprod.TiledImage.prototype.getNumTiles = function() {
  return this.tilesPerRow_ * this.tilesPerCol_;
};

/**
 * @return {number}
 */
dotprod.TiledImage.prototype.getTileWidth = function() {
  return Math.floor(this.node_.width / this.tilesPerRow_);
};

/**
 * @return {number}
 */
dotprod.TiledImage.prototype.getTileHeight = function() {
  return Math.floor(this.node_.height / this.tilesPerCol_);
}

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number=} opt_tileNum
 */
dotprod.TiledImage.prototype.render = function(context, x, y, opt_tileNum) {
  if (opt_tileNum === undefined) {
    dotprod.TiledImage.superClass_.render.call(this, context, x, y);
    return;
  }

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
};
