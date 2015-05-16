goog.provide('Viewport');

goog.require('math.Range');

/**
 * @constructor
 * @param {!Game} game
 * @param {!CanvasRenderingContext2D} context
 */
Viewport = function(game, context) {
  /**
   * @type {number}
   * @private
   */
  this.x_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.y_ = 0;

  /**
   * @type {!CanvasRenderingContext2D}
   * @private
   */
  this.context_ = context;

  /**
   * @type {model.player.Player}
   * @private
   */
  this.followingPlayer_;

  /**
   * @type {!math.Range}
   * @private
   */
  this.jitterTime_ = new math.Range(0, 1, 1);
};

/**
 * Maximum number of pixels the viewport can be offset by during jitter.
 *
 * @type {number}
 * @private
 * @const
 */
Viewport.MAX_JITTER_MAGNITUDE_ = 8;

/**
 * Shakes the viewport around the local player for the amount of time specified
 * in |ticks|.
 *
 * @param {number} ticks
 */
Viewport.prototype.jitter = function(ticks) {
  this.jitterTime_ = new math.Range(0, ticks, 1);
  this.jitterTime_.setHigh();
};

/**
 * @param {!model.player.Player} player
 */
Viewport.prototype.followPlayer = function(player) {
  this.followingPlayer_ = player;
};

Viewport.prototype.update = function() {
  if (!this.followingPlayer_) {
    return;
  }

  var position = this.followingPlayer_.getPosition();
  this.x_ = Math.floor(position.getX());
  this.y_ = Math.floor(position.getY());

  this.jitterTime_.decrement();
};

/**
 * @return {!Object}
 */
Viewport.prototype.getDimensions = function() {
  var ratio = this.getHdpiRatio();
  var width = this.context_.canvas.width / ratio;
  var height = this.context_.canvas.height / ratio;

  var magnitude = this.jitterTime_.getValue() / this.jitterTime_.getHigh() * Viewport.MAX_JITTER_MAGNITUDE_;
  var x = this.x_ + Math.floor((Math.random() - 0.5) * 2 * magnitude);
  var y = this.y_ + Math.floor((Math.random() - 0.5) * 2 * magnitude);

  return {
    x: x,
    y: y,
    width: width,
    height: height,
    left: x - Math.floor(width / 2),
    right: x + Math.floor(width / 2),
    top: y - Math.floor(height / 2),
    bottom: y + Math.floor(height / 2)
  };
};

/**
 * @param {!math.Vector} vector The vector to test.
 * @return {boolean} True if the vector is contained in the viewport false otherwise.
 */
Viewport.prototype.contains = function(vector) {
	var x = vector.getX();
	var y = vector.getY();
	var dimensions = this.getDimensions();
  return x >= dimensions.left && x <= dimensions.right &&
         y >= dimensions.top && y <= dimensions.bottom;
};

/**
 * @return {!CanvasRenderingContext2D}
 */
Viewport.prototype.getContext = function() {
  return this.context_;
};

/**
 * See http://www.html5rocks.com/en/tutorials/canvas/hidpi/ for an explanation
 * of this inanity.
 *
 * @return {number}
 */
Viewport.prototype.getHdpiRatio = function() {
  var backingStorePixelRatio = this.context_.backingStorePixelRatio || 1;
  return window.devicePixelRatio / backingStorePixelRatio;
};
