/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

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
 * @return {!CanvasRenderingContext2D}
 */
Viewport.prototype.getContext = function() {
  return this.context_;
};
