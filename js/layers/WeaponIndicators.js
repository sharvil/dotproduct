/**
 * @fileoverview Heads-up display layer
 */

goog.provide('dotprod.layers.WeaponIndicators');

goog.require('dotprod.graphics.Drawable');

/**
 * @constructor
 * @param {!dotprod.Game} game
 * @implements {dotprod.graphics.Drawable}
 */
dotprod.layers.WeaponIndicators = function(game) {
  /**
   * @type {!dotprod.model.player.LocalPlayer}
   * @private
   */
  this.localPlayer_ = game.getPlayerIndex().getLocalPlayer();

  /**
   * @type {!dotprod.graphics.Image}
   * @private
   */
  this.icons_ = game.getResourceManager().getImage('icons');

  game.getPainter().registerDrawable(dotprod.graphics.Layer.HUD, this);
};

/**
 * @override
 */
dotprod.layers.WeaponIndicators.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();

  // TODO(sharvil): don't reach into Player's private members.
  var gunLevel = this.localPlayer_.gun_.getLevel();
  var bombLevel = this.localPlayer_.bombBay_.getLevel();
  var bursts = this.localPlayer_.burst_.getCount();
  var numIndicators = 2;
  var padding = 1;

  var top = Math.floor((dimensions.height - (numIndicators * this.icons_.getTileHeight() + (numIndicators - 1) * padding)) / 2);
  var left = dimensions.width - this.icons_.getTileWidth();

  this.renderLeveledWeapon_(context, left, top, gunLevel, 0);
  top += padding + this.icons_.getTileHeight();
  this.renderLeveledWeapon_(context, left, top, bombLevel, 18);

  this.icons_.render(context, (bursts > 0) ? 0 : 4 - this.icons_.getTileWidth(), top, 30);
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {number} left
 * @param {number} top
 * @param {number} level
 * @param {number} tileNum
 */
dotprod.layers.WeaponIndicators.prototype.renderLeveledWeapon_ = function(context, left, top, level, tileNum) {
  if (level >= 0) {
    tileNum += level;
  } else {
    left += this.icons_.getTileWidth() - 4;
  }
  this.icons_.render(context, left, top, tileNum);
};
