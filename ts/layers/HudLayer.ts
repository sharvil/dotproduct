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
    this.player_ = game.simulation.playerList.localPlayer;
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
  }

  private renderEnergyBar_(context : CanvasRenderingContext2D, dimensions : any) {
    let percentEnergy = this.player_.energy / this.player_.maxEnergy;
    let energyBarMaxWidth = Math.floor(dimensions.width * 0.25);
    let energyBarWidth = percentEnergy * energyBarMaxWidth;
    let energyBarHeight = 10;

    context.save();
    // Energy bar
    context.fillStyle =
      percentEnergy < 0.25 ? Palette.energyCriticalColor() :
      percentEnergy < 0.50 ? Palette.energyWarningColor() : Palette.energyNormalColor();
    context.fillRect((dimensions.width - energyBarWidth) / 2, 10, energyBarWidth, energyBarHeight);

    // Energy bar top
    context.beginPath();
    context.strokeStyle = Palette.borderColor();
    context.strokeRect((dimensions.width - energyBarMaxWidth) / 2, 10, energyBarMaxWidth, 10);
    context.restore();
  }

  private renderNearShipEnergyDisplay_(context : CanvasRenderingContext2D, dimensions : any) {
    if (!this.player_.isAlive) {
      return;
    }

    let energy = this.player_.energy;
    let playerDimensions = this.player_.getDimensions();
    let percentEnergy = energy / this.player_.maxEnergy;

    if (percentEnergy < 0.5) {
      let x = Math.floor(playerDimensions.left - dimensions.left - 10);
      let y = Math.floor(playerDimensions.top - dimensions.top);

      context.save();
      context.fillStyle = percentEnergy < 0.25 ? Palette.energyCriticalColor() : Palette.energyWarningColor();
      context.font = Font.playerFont().toString();
      context.textAlign = 'right';
      context.textBaseline = 'bottom';
      context.fillText(energy.toString(), x, y);
      context.restore();
    }
  }
}
