/**
 * @fileoverview Head-up display layer
 */

goog.provide('dotprod.layers.HudLayer');

goog.require('dotprod.entities.LocalPlayer');
goog.require('dotprod.entities.Player');
goog.require('dotprod.layers.Layer');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.Game} game
 */
dotprod.layers.HudLayer = function (game) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!dotprod.ResourceManager}
   * @private
   */
  this.resourceManager_ = game.getResourceManager();

  /**
   * @type {!dotprod.entities.Player}
   * @private
   */
  this.player_ = game.getPlayerIndex().getLocalPlayer();
};

/**
 * @override
 */
dotprod.layers.HudLayer.prototype.update = function () {};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.HudLayer.prototype.render = function (camera) {
  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  this.renderEnergyBar_(context, dimensions);
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 */
dotprod.layers.HudLayer.prototype.renderEnergyBar_ = function (context, dimensions) {
  if (this.player_) {
    var percentEnergy = this.player_.getEnergy() / this.player_.getMaxEnergy();
    var energyBarMaxWidth = 300;
    var energyBarWidth = percentEnergy * energyBarMaxWidth;
    var energyBarHeight = 10;

    context.save();
      //Energy bar
      context.fillStyle = percentEnergy < 0.25 ? 'rgba(200, 0, 0, 0.3)' :
                          percentEnergy < 0.5 ? 'rgba(200, 200, 0, 0.3)' :
                          percentEnergy < 0.75 ? 'rgba(0, 200, 0, 0.3)' :
                          'rgba(0, 200, 200, 0.3)';
      context.fillRect((dimensions.width - energyBarWidth) / 2, 10, energyBarWidth, energyBarHeight);

      //Energy bar markings
      context.beginPath();
      context.lineWidth = 1.3;
      context.strokeStyle = 'rgba(127, 127, 127, 0.5)';
      context.moveTo(dimensions.width / 2, 10);
      context.lineTo(dimensions.width / 2, 10 + 0.9 * energyBarHeight);
      context.moveTo((dimensions.width - 0.25 * energyBarMaxWidth) / 2, 10);
      context.lineTo((dimensions.width - 0.25 * energyBarMaxWidth) / 2, 10 + 0.5 * energyBarHeight);
      context.moveTo((dimensions.width + 0.25 * energyBarMaxWidth) / 2, 10);
      context.lineTo((dimensions.width + 0.25 * energyBarMaxWidth) / 2, 10 + 0.5 * energyBarHeight);
      context.moveTo((dimensions.width - 0.5 * energyBarMaxWidth) / 2, 10);
      context.lineTo((dimensions.width - 0.5 * energyBarMaxWidth) / 2, 10 + 0.5 * energyBarHeight);
      context.moveTo((dimensions.width + 0.5 * energyBarMaxWidth) / 2, 10);
      context.lineTo((dimensions.width + 0.5 * energyBarMaxWidth) / 2, 10 + 0.5 * energyBarHeight);
      context.moveTo((dimensions.width - 0.75 * energyBarMaxWidth) / 2, 10);
      context.lineTo((dimensions.width - 0.75 * energyBarMaxWidth) / 2, 10 + 0.5 * energyBarHeight);
      context.moveTo((dimensions.width + 0.75 * energyBarMaxWidth) / 2, 10);
      context.lineTo((dimensions.width + 0.75 * energyBarMaxWidth) / 2, 10 + 0.5 * energyBarHeight);
      context.stroke();

      //Energy bar top
      context.beginPath();
      context.strokeStyle = 'rgba(127, 127, 127, 1)';
      context.moveTo((dimensions.width - energyBarMaxWidth) / 2, 10);
      context.lineTo((dimensions.width + energyBarMaxWidth) / 2, 10);
      context.stroke();
    context.restore();
  }
};
