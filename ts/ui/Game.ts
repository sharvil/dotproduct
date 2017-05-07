import Flag from 'model/Flag';
import Painter from 'graphics/Painter';
import Keyboard from 'input/Keyboard';
import Mouse from 'input/Mouse';
import HudLayer from 'layers/HudLayer';
import NotificationLayer from 'layers/NotificationLayer';
import MapLayer from 'layers/MapLayer';
import RadarLayer from 'layers/RadarLayer';
import Starfield from 'layers/Starfield';
import WeaponIndicators from 'layers/WeaponIndicators';
import GraphicalModelObjectFactory from 'model/impl/GraphicalModelObjectFactory';
import Player from 'model/player/Player';
import Prize from 'model/Prize';
import Simulation from 'model/Simulation';
import Notifications from 'Notifications';
import Protocol from 'net/Protocol';
import Timer from 'time/Timer';
import Viewport from 'Viewport';
import Chat from 'ui/Chat';
import Debug from 'ui/Debug';
import Disconnected from 'ui/Disconnected';
import ResourceManager from 'ResourceManager';
import { PrizeType } from 'types';
import Vector from 'math/Vector';
import Listener from 'Listener';
import RemotePlayer from 'model/player/RemotePlayer';
import MenuBar from 'ui/MenuBar';

export default class Game {
  private protocol_ : Protocol;
  private resourceManager_ : ResourceManager;
  private simulation_ : Simulation;
  private painter_ : Painter;
  private keyboard_ : Keyboard;
  private mouse_ : Mouse;
  private canvas_ : HTMLCanvasElement;
  private viewport_ : Viewport;
  private notifications_ : Notifications;
  private chatView_ : Chat;
  private menuBar_ : MenuBar;
  private debugView_ : Debug;
  private disconnectedView_ : Disconnected;
  private lastTime_ : number;
  private tickResidue_ : number;
  private animationId_ : number;

  constructor(protocol : Protocol, resourceManager : ResourceManager, settings : Object, mapData : any, tileProperties : Array<Object>) {
    this.protocol_ = protocol;
    this.resourceManager_ = resourceManager;
    this.keyboard_ = new Keyboard();
    this.mouse_ = new Mouse();
    this.painter_ = new Painter();
    this.simulation_ = new Simulation(new GraphicalModelObjectFactory(this), protocol, settings, mapData, tileProperties);
    this.canvas_ = <HTMLCanvasElement> document.getElementById('gv-canvas');
    this.viewport_ = new Viewport(this, <CanvasRenderingContext2D> (this.canvas_.getContext('2d')));

    const localPlayer = this.simulation_.playerList.localPlayer;
    const startingShip = localPlayer.ship;
    this.notifications_ = new Notifications(localPlayer);

    this.chatView_ = new Chat(this);
    this.chatView_.addSystemMessage('Welcome to dotproduct! Press ? for help.');
    this.menuBar_ = new MenuBar(this);
    this.debugView_ = new Debug(this, protocol);
    this.disconnectedView_ = new Disconnected();
    this.lastTime_ = Date.now();
    this.tickResidue_ = 0;
    this.animationId_ = 0;

    new Starfield(this);
    new MapLayer(this);
    new NotificationLayer(this, this.notifications_);
    new RadarLayer(this);
    new HudLayer(this);
    new WeaponIndicators(this);

    this.protocol_.registerEventHandler(this.onConnectionLost_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_ENTERED, this.onPlayerEntered_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_LEFT, this.onPlayerLeft_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_DIED, this.onPlayerDied_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.CHAT_MESSAGE, this.onChatMessage_.bind(this));
    this.protocol_.startGame(this.simulation_, startingShip);

    this.viewport_.followPlayer(localPlayer);

    Listener.add(localPlayer, 'collect_prize', this.onLocalPlayerCollectedPrize_.bind(this));
    Listener.add(localPlayer, 'death', this.onLocalPlayerDied_.bind(this));
    Listener.add(localPlayer, 'usernotify', this.onLocalPlayerUserNotify_.bind(this));
    Listener.add(this.chatView_, 'onmessage', this.onSendChatMessage_.bind(this));

    window.addEventListener('resize', this.onResize_.bind(this));
    window.addEventListener('focus', function () { localPlayer.clearPresence(Player.Presence.AWAY); });
    window.addEventListener('blur', function () { localPlayer.setPresence(Player.Presence.AWAY); });

    Timer.setInterval(this.heartbeat_.bind(this), 100);
    Notification.requestPermission();

    // Make sure the game canvas is the right size and start rendering loop.
    (<HTMLDivElement> document.getElementById('game')).classList.add('in-game');
    this.onResize_();
    this.renderingLoop_();
  }

  public get simulation() : Simulation {
    return this.simulation_;
  }

  public getPainter() : Painter {
    return this.painter_;
  }

  public getKeyboard() : Keyboard {
    return this.keyboard_;
  }

  public getMouse() : Mouse {
    return this.mouse_;
  }

  public getResourceManager() : ResourceManager {
    return this.resourceManager_;
  }

  public getViewport() : Viewport {
    return this.viewport_;
  }

  private heartbeat_() {
    // Keep the game running even if we're in the background.
    let curTime = Date.now();
    while (curTime - this.lastTime_ > 500) {
      cancelAnimationFrame(this.animationId_);
      this.renderingLoop_();
    }
  }

  private renderingLoop_() {
    this.animationId_ = requestAnimationFrame(this.renderingLoop_.bind(this));

    let curTime = Date.now();
    let timeDiff = Timer.millisToTicks(curTime - this.lastTime_ + this.tickResidue_);

    timeDiff = Math.min(timeDiff, Simulation.MAX_TICKS_PER_FRAME);

    for (let i = 0; i < timeDiff; ++i) {
      this.simulation_.advanceTime();
    }

    this.viewport_.update();

    this.painter_.render(this.viewport_);

    this.debugView_.update();

    this.tickResidue_ += curTime - this.lastTime_;
    this.tickResidue_ -= Timer.ticksToMillis(timeDiff);
    this.lastTime_ = curTime;
  }

  private onConnectionLost_() {
    let self = this;
    this.renderingLoop_ = function () { self.lastTime_ = Date.now(); };
    this.disconnectedView_.show();
  }

  private onPlayerEntered_(packet : Array<any>) {
    this.notifications_.addEnterMessage(`Player entered: ${packet[1]}`);
  }

  private onPlayerLeft_(packet : Array<any>) {
    const player = this.simulation_.playerList.findById(packet[0]);
    if (player) {
      this.notifications_.addEnterMessage(`Player left: ${player.name}`);
    }
  }

  private onPlayerDied_(packet : Array<any>) {
    const killee = this.simulation_.playerList.findById(packet[2]);
    const killer = this.simulation_.playerList.findById(packet[3]);
    const bountyGained = packet[4];

    if (!killer || !killee) {
      return;
    }

    const message = `${killee.name}(${bountyGained}) killed by: ${killer.name}`;
    if (killer == this.simulation_.playerList.localPlayer) {
      this.notifications_.addPersonalMessage(message);
    } else {
      this.notifications_.addMessage(message);
    }
  }

  private onChatMessage_(packet : Array<any>) {
    const playerId = packet[0];
    const message = packet[1];

    if (playerId == Player.SYSTEM_PLAYER_ID) {
      this.chatView_.addSystemMessage(message);
    } else {
      const player = this.simulation_.playerList.findById(playerId);
      if (player) {
        this.chatView_.addMessage(player, message);
      }
    }
  }

  private onLocalPlayerDied_(player : Player, killer : Player) {
    this.notifications_.addPersonalMessage('You were killed by ' + killer.name + '!');
  }

  private onLocalPlayerUserNotify_(player : Player, message : string) {
    this.notifications_.addMessage(message);
  }

  private onSendChatMessage_(chat : Chat, message : string) {
    this.protocol_.sendChat(message);
  }

  // Event handler for when the local player picks up a prize. Notify the server
  // if the prize was granted by the local simulation (i.e. prize is not null).
  private onLocalPlayerCollectedPrize_(player : Player, prize? : Prize) {
    if (!prize) {
      return;
    }

    switch (prize.getType()) {
      case PrizeType.NONE:
        this.notifications_.addMessage('No prize for you. Sadface.');
        break;
      case PrizeType.GUN_UPGRADE:
        this.notifications_.addMessage('Guns upgraded.');
        break;
      case PrizeType.BOMB_UPGRADE:
        this.notifications_.addMessage('Bombs upgraded.');
        break;
      case PrizeType.FULL_ENERGY:
        this.notifications_.addMessage('Full charge.');
        break;
      case PrizeType.BOUNCING_BULLETS:
        this.notifications_.addMessage('Bouncing bullets.');
        break;
      case PrizeType.MULTIFIRE:
        this.notifications_.addMessage('Multifire bullets.');
        break;
      default:
        assert(false, 'Unhandled prize type: ' + prize.getType());
    }
  }

  private onResize_ = function () {
    let width = window.innerWidth - this.canvas_.parentNode.offsetLeft;
    let height = window.innerHeight - this.canvas_.parentNode.offsetTop;

    let ratio = this.viewport_.getHdpiRatio();

    this.canvas_.width = width * ratio;
    this.canvas_.height = height * ratio;

    this.canvas_.style.width = width + 'px';
    this.canvas_.style.height = height + 'px';

    let context = this.canvas_.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.scale(ratio, ratio);

    // The chat window goes to the left of the radar.
    let size = RadarLayer.sizeForViewport(this.viewport_);
    this.chatView_.setRightPosition(size.width);
  }
}
