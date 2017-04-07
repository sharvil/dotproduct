import Drawable from 'graphics/Drawable';
import Key from 'input/Key';
import Rect from 'math/Rect';
import { Layer } from 'graphics/Layer';
import Mouse from 'input/Mouse';
import LocalPlayer from 'model/player/LocalPlayer';
import Image from 'graphics/Image';
import Game from 'ui/Game';
import Viewport from 'Viewport';

export default class WeaponIndicators implements Drawable {
  private static readonly TOOLTIP_HIDE_CLASS_NAME_ = 'tt-hide';

  private localPlayer_ : LocalPlayer;
  private mouse_ : Mouse;
  private icons_ : Image;
  private tooltip_ : HTMLDivElement;

  constructor(game : Game) {
    this.localPlayer_ = game.getPlayerIndex().getLocalPlayer();
    this.mouse_ = game.getMouse();
    this.icons_ = game.getResourceManager().getImage('icons');
    this.tooltip_ = <HTMLDivElement> document.getElementById('tt');

    game.getPainter().registerDrawable(Layer.HUD, this);
  }

  public render(viewport : Viewport) {
    var context = viewport.getContext();
    var dimensions = viewport.getDimensions();

    var gunLevel = this.localPlayer_.gunLevel;
    var bombLevel = this.localPlayer_.bombLevel;
    var bursts = this.localPlayer_.burstCount;
    var decoys = this.localPlayer_.decoyCount;
    var numIndicators = 2;
    var padding = 1;

    var width = this.icons_.getTileWidth();
    var height = this.icons_.getTileHeight();
    var top = Math.floor((dimensions.height - (numIndicators * height + (numIndicators - 1) * padding)) / 2);
    var left = dimensions.width - width;

    this.tooltip_.classList.add(WeaponIndicators.TOOLTIP_HIDE_CLASS_NAME_);

    var label = 'Guns: ' + Key.Name[Key.Map.FIRE_GUN];
    this.renderLeveledWeapon_(context, new Rect(left, top, width, height), gunLevel, 0, label);

    label = 'Burst: ' + Key.Name[Key.Map.FIRE_BURST];
    this.renderConsumableWeapon_(context, new Rect(0, top, width, height), bursts, 30, label);

    top += padding + height;

    label = 'Bombs: ' + Key.Name[Key.Map.FIRE_BOMB] + '\n';
    label += 'Mines: ' + Key.Name[Key.Map.FIRE_MINE];
    this.renderLeveledWeapon_(context, new Rect(left, top, width, height), bombLevel, 18, label);

    label = 'Decoy: ' + Key.Name[Key.Map.FIRE_DECOY];
    this.renderConsumableWeapon_(context, new Rect(0, top, width, height), decoys, 40, label);
  }

  private renderLeveledWeapon_(context : CanvasRenderingContext2D, rect : Rect, level : number, tileNum : number, label : string) {
    var x = rect.x;
    var y = rect.y;

    if (level >= 0) {
      tileNum += level;
      if (this.mouse_.isHovering(rect)) {
        this.tooltip_.classList.remove(WeaponIndicators.TOOLTIP_HIDE_CLASS_NAME_);
        this.tooltip_.style.top = rect.y + 'px';
        this.tooltip_.style.right = rect.width + 'px';
        this.tooltip_.style.left = '';
        this.tooltip_.innerText = label;
      }
    } else {
      x += rect.width - 4;
    }

    this.icons_.render(context, x, y, tileNum);
  }

  private renderConsumableWeapon_(context : CanvasRenderingContext2D, rect : Rect, count : number, tileNum : number, label : string) {
    var x = rect.x;
    var y = rect.y;

    if (count <= 0) {
      x -= rect.width - 4;
    } else if (this.mouse_.isHovering(rect)) {
      this.tooltip_.classList.remove(WeaponIndicators.TOOLTIP_HIDE_CLASS_NAME_);
      this.tooltip_.style.top = rect.y + 'px';
      this.tooltip_.style.left = rect.width + 'px';
      this.tooltip_.style.right = '';
      this.tooltip_.innerText = label;
    }

    this.icons_.render(context, x, y, tileNum);
  }
}
