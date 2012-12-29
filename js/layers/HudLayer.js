/**
 * @fileoverview Heads-up display layer
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
dotprod.layers.HudLayer.prototype.update = function () {};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.HudLayer.prototype.render = function (camera) {
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
dotprod.layers.HudLayer.prototype.renderEnergyBar_ = function (context, dimensions) {
  if (this.player_) {
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
  }
};

/**
 * @param {!CanvasRenderingContext2D} canvas
 * @param {!Object} dimensions
 */
dotprod.layers.HudLayer.prototype.renderNearShipEnergyDisplay_ = function (context, dimensions) {
  if (this.player_) {
    var percentEnergy = this.player_.getEnergy() / this.player_.getMaxEnergy();

    if (percentEnergy < 0.5) {
      var x = Math.floor(this.player_.position_.getX() - dimensions.left - this.player_.image_.getTileWidth() / 2 - 10);
      var y = Math.floor(this.player_.position_.getY() - dimensions.top - this.player_.image_.getTileHeight() / 2);

      context.save();
        context.fillStyle = percentEnergy < 0.25 ? 'rgba(200, 0, 0, 0.5)' :
                            percentEnergy < 0.5 ? 'rgba(200, 200, 0, 0.5)' :
                            percentEnergy < 0.75 ? 'rgba(0, 200, 0, 0.5)' :
                            'rgba(0, 200, 200, 0.5)';
        context.font = dotprod.FontFoundry.playerFont();
        context.textAlign = 'right';
        context.textBaseline = 'bottom';
        context.fillText(Math.floor(this.player_.energy_), x, y);
      context.restore();
    }
  }
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 */
dotprod.layers.HudLayer.prototype.renderShipInfoDisplay_ = function (context, dimensions) {
  var statusHudLeft = dimensions.width - this.statusHudImage_.getTileWidth();
  var statusHudRight = statusHudLeft + this.statusHudImage_.getTileWidth();
  var statusHudTop = 50;

  this.statusHudImage_.render(context, statusHudLeft, statusHudTop);

  if (this.player_) {
    var energyDigits = Math.floor(this.player_.getEnergy());
    var digitOffset = 0;
    var offsetWidth = this.energyFontImage_.getTileWidth();
    do {
      this.energyFontImage_.render(context, statusHudRight - 30 - digitOffset * offsetWidth, statusHudTop - 5, energyDigits % 10);
      energyDigits = Math.floor(energyDigits / 10);
      ++digitOffset;
    } while (energyDigits);

    var bountyDigits = this.player_.getBounty();
    var digitOffset = 0;
    var offsetWidth = this.ledFontImage_.getTileWidth();
    do {
      this.ledFontImage_.render(context, statusHudLeft + 65 - digitOffset * offsetWidth, statusHudTop + 52, bountyDigits % 10);
      bountyDigits = Math.floor(bountyDigits / 10);
      ++digitOffset;
    } while (bountyDigits);
  }
};
