import Drawable from 'graphics/Drawable';
import Image from 'graphics/Image';
import Game from 'ui/Game';
import { Layer } from 'graphics/Layer';
import ResourceManager from 'ResourceManager';
import Player from 'model/player/Player';
import Font from 'Font';
import Palette from 'Palette';
import Viewport from 'Viewport';

export default class HudLayer implements Drawable {
  private game_ : Game;
  private resourceManager_ : ResourceManager;
  private player_ : Player;
  private statusHudImage_ : Image;
  private energyFontImage_ : Image;
  private ledFontImage_ : Image;

  constructor(game : Game) {
    this.game_ = game;
    this.resourceManager_ = game.getResourceManager();
    this.player_ = game.getPlayerIndex().getLocalPlayer();
    this.statusHudImage_ = this.resourceManager_.getImage('statusHud');
    this.energyFontImage_ = this.resourceManager_.getImage('energyFont');
    this.ledFontImage_ = this.resourceManager_.getImage('ledFont');

    game.getPainter().registerDrawable(Layer.HUD, this);
  }

  public render(viewport : Viewport) {
    let context = viewport.getContext();
    let dimensions = viewport.getDimensions();

    this.renderEnergyBar_(context, dimensions);
    this.renderNearShipEnergyDisplay_(context, dimensions);
    this.renderShipInfoDisplay_(context, dimensions);
  }

  private renderEnergyBar_(context : CanvasRenderingContext2D, dimensions : any) {
    let percentEnergy = this.player_.getEnergy() / this.player_.getMaxEnergy();
    let energyBarMaxWidth = 300;
    let energyBarWidth = percentEnergy * energyBarMaxWidth;
    let energyBarHeight = 10;

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
    context.strokeStyle = 'rgb(127, 127, 127)';
    context.moveTo((dimensions.width - energyBarMaxWidth) / 2, 10);
    context.lineTo((dimensions.width + energyBarMaxWidth) / 2, 10);
    context.stroke();
    context.restore();
  }

  private renderNearShipEnergyDisplay_(context : CanvasRenderingContext2D, dimensions : any) {
    if (!this.player_.isAlive()) {
      return;
    }

    let energy = this.player_.getEnergy();
    let playerDimensions = this.player_.getDimensions();
    let percentEnergy = energy / this.player_.getMaxEnergy();

    if (percentEnergy < 0.5) {
      let x = Math.floor(playerDimensions.left - dimensions.left - 10);
      let y = Math.floor(playerDimensions.top - dimensions.top);

      context.save();
      context.fillStyle = percentEnergy < 0.25 ? Palette.criticalEnergyWarningColor() : Palette.lowEnergyWarningColor();
      context.font = Font.playerFont().toString();
      context.textAlign = 'right';
      context.textBaseline = 'bottom';
      context.fillText(energy.toString(), x, y);
      context.restore();
    }
  }

  private renderShipInfoDisplay_(context : CanvasRenderingContext2D, dimensions : any) {
    let statusHudLeft = dimensions.width - this.statusHudImage_.getTileWidth();
    let statusHudRight = statusHudLeft + this.statusHudImage_.getTileWidth();
    let statusHudTop = 5;

    this.statusHudImage_.render(context, statusHudLeft, statusHudTop);

    // Energy
    let self = this;
    let x = statusHudRight - 30;
    let y = statusHudTop - 5;
    this.forEachDigitInReverse_(this.player_.getEnergy(), function (digit) {
      self.energyFontImage_.render(context, x, y, digit);
      x -= self.energyFontImage_.getTileWidth();
    });

    // Team
    x = statusHudLeft + 65;
    y = statusHudTop + 28;
    this.forEachDigitInReverse_(this.player_.getTeam(), function (digit) {
      self.ledFontImage_.render(context, x, y, digit);
      x -= self.ledFontImage_.getTileWidth();
    });

    // Bounty
    x = statusHudLeft + 65;
    y = statusHudTop + 52;
    this.forEachDigitInReverse_(this.player_.getBounty(), function (digit) {
      self.ledFontImage_.render(context, x, y, digit);
      x -= self.ledFontImage_.getTileWidth();
    });
  }

  private forEachDigitInReverse_(num : number, callback : (digit : number) => void) {
    num = Math.floor(num);
    do {
      callback(num % 10);
      num = Math.floor(num / 10);
    } while (num != 0);
  }
}
