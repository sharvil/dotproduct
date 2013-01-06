/**
 * @fileoverview Heads-up display layer
 */

goog.provide('dotprod.layers.HudLayer');

goog.require('dotprod.model.player.LocalPlayer');
goog.require('dotprod.model.player.Player');
goog.require('dotprod.layers.Layer');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.Game} game
 */
dotprod.layers.HudLayer = function(game) {
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
   * @type {!dotprod.model.player.Player}
   * @private
   */
  this.player_ = game.getPlayerIndex().getLocalPlayer();

  /**
   * @type {!dotprod.Image}
   * @private
   */
  this.statusHudImage_ = this.resourceManager_.getImage('statusHud');

  /**
   * @type {!dotprod.Image}
   * @private
   */
  this.energyFontImage_ = this.resourceManager_.getImage('energyFont');

  /**
   * @type {!dotprod.Image}
   * @private
   */
  this.ledFontImage_ = this.resourceManager_.getImage('ledFont');
};

/**
 * @override
 */
dotprod.layers.HudLayer.prototype.update = goog.nullFunction;

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.HudLayer.prototype.render = function(camera) {
  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  this.renderEnergyBar_(context, dimensions);
  this.renderNearShipEnergyDisplay_(context, dimensions);
  this.renderShipInfoDisplay_(context, dimensions);
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 */
dotprod.layers.HudLayer.prototype.renderEnergyBar_ = function(context, dimensions) {
  var percentEnergy = this.player_.getEnergy() / this.player_.getMaxEnergy();
  var energyBarMaxWidth = 300;
  var energyBarWidth = percentEnergy * energyBarMaxWidth;
  var energyBarHeight = 10;

  context.save();
    // Energy bar
    context.fillStyle = percentEnergy < 0.25 ? 'rgba(200, 0, 0, 0.3)' :
                        percentEnergy < 0.5 ? 'rgba(200, 200, 0, 0.3)' :
                        percentEnergy < 0.75 ? 'rgba(0, 200, 0, 0.3)' :
                        'rgba(0, 200, 200, 0.3)';
    context.fillRect((dimensions.width - energyBarWidth) / 2, 10, energyBarWidth, energyBarHeight);

    // Energy bar markings
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

    // Energy bar top
    context.beginPath();
    context.strokeStyle = 'rgba(127, 127, 127, 1)';
    context.moveTo((dimensions.width - energyBarMaxWidth) / 2, 10);
    context.lineTo((dimensions.width + energyBarMaxWidth) / 2, 10);
    context.stroke();
  context.restore();
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 */
dotprod.layers.HudLayer.prototype.renderNearShipEnergyDisplay_ = function(context, dimensions) {
  if (!this.player_.isAlive()) {
    return;
  }

  var energy = this.player_.getEnergy();
  var playerDimensions = this.player_.getDimensions();
  var percentEnergy = energy / this.player_.getMaxEnergy();

  if (percentEnergy < 0.5) {
    var x = Math.floor(playerDimensions.left - dimensions.left - 10);
    var y = Math.floor(playerDimensions.top - dimensions.top);

    context.save();
      context.fillStyle = percentEnergy < 0.25 ? 'rgba(200, 0, 0, 0.5)' :
                          percentEnergy < 0.5 ? 'rgba(200, 200, 0, 0.5)' :
                          percentEnergy < 0.75 ? 'rgba(0, 200, 0, 0.5)' :
                          'rgba(0, 200, 200, 0.5)';
      context.font = dotprod.FontFoundry.playerFont();
      context.textAlign = 'right';
      context.textBaseline = 'bottom';
      context.fillText(energy.toString(), x, y);
    context.restore();
  }
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 */
dotprod.layers.HudLayer.prototype.renderShipInfoDisplay_ = function(context, dimensions) {
  var statusHudLeft = dimensions.width - this.statusHudImage_.getTileWidth();
  var statusHudRight = statusHudLeft + this.statusHudImage_.getTileWidth();
  var statusHudTop = 50;

  this.statusHudImage_.render(context, statusHudLeft, statusHudTop);

  // Energy
  var self = this;
  var x = statusHudRight - 30;
  var y = statusHudTop - 5;
  this.forEachDigitInReverse_(this.player_.getEnergy(), function(digit) {
    self.energyFontImage_.render(context, x, y, digit);
    x -= self.energyFontImage_.getTileWidth();
  });

  // Team
  x = statusHudLeft + 65;
  y = statusHudTop + 28;
  this.forEachDigitInReverse_(this.player_.getTeam(), function(digit) {
    self.ledFontImage_.render(context, x, y, digit);
    x -= self.ledFontImage_.getTileWidth();
  });

  // Bounty
  x = statusHudLeft + 65;
  y = statusHudTop + 52;
  this.forEachDigitInReverse_(this.player_.getBounty(), function(digit) {
    self.ledFontImage_.render(context, x, y, digit);
    x -= self.ledFontImage_.getTileWidth();
  });
};

/**
 * @param {number} num
 * @param {function(number)} callback
 */
dotprod.layers.HudLayer.prototype.forEachDigitInReverse_ = function(num, callback) {
  num = Math.floor(num);
  do {
    callback(num % 10);
    num = Math.floor(num / 10);
  } while (num != 0);
};
