goog.provide('Viewport');

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
};

/**
 * @return {!Object}
 */
Viewport.prototype.getDimensions = function() {
  return {
    x: this.x_,
    y: this.y_,
    width: this.context_.canvas.width,
    height: this.context_.canvas.height,
    left: this.x_ - Math.floor(this.context_.canvas.width / 2),
    right: this.x_ + Math.floor(this.context_.canvas.width / 2),
    top: this.y_ - Math.floor(this.context_.canvas.height / 2),
    bottom: this.y_ + Math.floor(this.context_.canvas.height / 2)
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
