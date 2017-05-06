import Game from 'ui/Game';
import Image from 'graphics/Image';
import Listener from 'Listener';
import LocalPlayer from 'model/player/LocalPlayer';
import Menu from 'ui/Menu';
import MenuBar from 'ui/MenuBar';
import ResourceManager from 'ResourceManager';

export default class ShipSelectMenu implements Menu {
  private readonly menuBar_ : MenuBar;
  private readonly rootNode_ : HTMLDivElement;
  private readonly resourceManager_ : ResourceManager;
  private readonly player_ : LocalPlayer;

  constructor(menuBar : MenuBar, game : Game) {
    this.menuBar_ = menuBar;
    this.rootNode_ = <HTMLDivElement> document.getElementById('ss');
    this.resourceManager_ = game.getResourceManager();
    this.player_ = game.getPlayerList().getLocalPlayer();

    for (let i = 0; i < game.getSettings()['ships'].length; ++i) {
      this.addShip_(i, game.getSettings()['ships'][i]);
    }

    Listener.add(this.player_, 'shipchange', this.shipChange_.bind(this));
    this.shipChange_(this.player_, this.player_.ship);
  }

  public get rootNode() : HTMLDivElement {
    return this.rootNode_;
  }

  /** Event handler that's called when the local player's ship changes. */
  private shipChange_(target : LocalPlayer, ship : number) {
    let containers = document.getElementsByClassName('ss-c');
    for (let x = 0; x < containers.length; ++x) {
      containers[x].classList.remove('ss-cur');
    }
    containers[ship].classList.add('ss-cur');
  }

  /** Sets up the DOM nodes for a given ship type. */
  private addShip_(ship : number, shipSettings : any) {
    const image = this.resourceManager_.getImage('ship' + ship);
    const container = document.createElement('div');
    const canvas = document.createElement('canvas');

    container.classList.add('ss-c');

    canvas.width = image.tileWidth * window.devicePixelRatio;
    canvas.height = image.tileHeight * window.devicePixelRatio;
    canvas.style.width = image.tileWidth + 'px';
    canvas.style.height = image.tileHeight + 'px';

    let context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    image.render(context, 0, 0, 0);
    container.appendChild(canvas);
    container.addEventListener('click', this.selectShip_.bind(this, ship));
    this.rootNode_.appendChild(container);
  }

  /** Event handler that's called when the given ship type is clicked on. */
  private selectShip_(ship : number) {
    if (this.player_.requestShipChange(ship)) {
      this.menuBar_.dismiss(this);
    }
  }
}
