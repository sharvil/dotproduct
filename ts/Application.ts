import Game from 'ui/Game';
import Protocol from 'net/Protocol';
import ResourceManager from 'ResourceManager';
import Loading from 'ui/Loading';

export default class Application {
  private protocol_ : Protocol;
  private resourceManager_ : ResourceManager;
  private settings_ : any;
  private mapData_ : any;
  private mapProperties_ : any;
  private game_ : Game | undefined;
  private loadingView_ : Loading;

  constructor(settings : any, url : string) {
    this.protocol_ = new Protocol(url);
    this.resourceManager_ = new ResourceManager();
    this.settings_ = settings;
    this.mapData_ = {};
    this.mapProperties_ = {};
    this.loadingView_ = new Loading(this.resourceManager_, this.onLoadComplete_.bind(this));

    let loginData = {
      'strategy': settings.strategy,
      'accessToken': settings.accessToken
    };

    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.LOGIN_REPLY, this.startGame_.bind(this));
    this.protocol_.login(loginData);
  }

  private startGame_(packet : Array<any>) {
    if (packet[0] == 1) {
      const resources = packet[1];
      const settings = packet[2];
      const mapData = packet[3];
      const mapProperties = packet[4];

      this.settings_ = settings;
      this.mapData_ = mapData;
      this.mapProperties_ = mapProperties;

      this.loadingView_.load(resources);
    } else {
      alert('Login failure: ' + packet[1]);
    }
  }

  private onLoadComplete_() {
    this.game_ = new Game(this.protocol_, this.resourceManager_, this.settings_, this.mapData_, this.mapProperties_);
  }
}

const _main = function() {
  const settings = window['toObject'](window.location.hash.substr(1));
  let socketUri = 'ws://' + window.location.host + '/dotproduct/v1/' + settings['arena'];
  if (window.location.protocol == 'https:') {
    socketUri = socketUri.replace('ws://', 'wss://');
  }
  new Application(settings, socketUri);
  window.location.hash = '';
};

// Global exports for Closure Compiler so these symbols don't get mangled.
window['_main'] = _main;
