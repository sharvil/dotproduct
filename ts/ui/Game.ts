import FlagIndex from 'model/FlagIndex';
import Painter from 'graphics/Painter';
import Keyboard from 'input/Keyboard';
import Mouse from 'input/Mouse';
import HudLayer from 'layers/HudLayer';
import NotificationLayer from 'layers/NotificationLayer';
import MapLayer from 'layers/MapLayer';
import RadarLayer from 'layers/RadarLayer';
import Starfield from 'layers/Starfield';
import WeaponIndicators from 'layers/WeaponIndicators';
import Map from 'model/Map';
import GraphicalModelObjectFactory from 'model/impl/GraphicalModelObjectFactory';
import HeadlessModelObjectFactory from 'model/impl/HeadlessModelObjectFactory';
import Player from 'model/player/Player';
import Prize from 'model/Prize';
import Simulation from 'model/Simulation';
import Notifications from 'Notifications';
import PlayerIndex from 'model/PlayerIndex';
import PrizeIndex from 'model/PrizeIndex';
import Protocol from 'net/Protocol';
import Timer from 'time/Timer';
import Viewport from 'Viewport';
import Chat from 'ui/Chat';
import Debug from 'ui/Debug';
import Disconnected from 'ui/Disconnected';
import Scoreboard from 'ui/Scoreboard';
import ResourceManager from 'ResourceManager';
import ModelObjectFactory from 'model/ModelObjectFactory';
import { PrizeType } from 'types';
import Vector from 'math/Vector';
import Listener from 'Listener';
import RemotePlayer from 'model/player/RemotePlayer';
import Key from 'input/Key';

export default class Game {
  private static readonly MAX_TICKS_PER_FRAME_ : number = 150;

  private protocol_ : Protocol;
  private resourceManager_ : ResourceManager;
  private modelObjectFactory_ : ModelObjectFactory;
  private simulation_ : Simulation;
  private painter_ : Painter;
  private settings_ : Object;
  private keyboard_ : Keyboard;
  private mouse_ : Mouse;
  private canvas_ : HTMLCanvasElement;
  private viewport_ : Viewport;
  private map_ : Map;
  private playerIndex_ : PlayerIndex;
  private prizeIndex_ : PrizeIndex;
  private flagIndex_ : FlagIndex;
  private notifications_ : Notifications;
  private chatView_ : Chat;
  private scoreboardView_ : Scoreboard;
  private debugView_ : Debug;
  private disconnectedView_ : Disconnected;
  private lastTime_ : number;
  private tickResidue_ : number;
  private animationId_ : number;

  constructor(protocol : Protocol, resourceManager : ResourceManager, settings : Object, mapData : any, tileProperties : Array<Object>) {
    this.protocol_ = protocol;
    this.resourceManager_ = resourceManager;
    this.modelObjectFactory_ = new GraphicalModelObjectFactory();
    this.simulation_ = new Simulation(this.modelObjectFactory_);
    this.painter_ = new Painter();
    this.settings_ = settings;
    this.keyboard_ = new Keyboard();
    this.mouse_ = new Mouse();
    this.canvas_ = <HTMLCanvasElement> document.getElementById('gv-canvas');
    this.viewport_ = new Viewport(this, <CanvasRenderingContext2D> (this.canvas_.getContext('2d')));
    this.map_ = new Map(this, mapData, tileProperties);

    var startingShip = Math.floor(Math.random() * this.settings_['ships'].length);
    var localPlayer = this.modelObjectFactory_.newLocalPlayer(this, this.settings_['id'], this.settings_['name'], this.settings_['team'], startingShip);
    this.playerIndex_ = new PlayerIndex(localPlayer);
    this.prizeIndex_ = new PrizeIndex(this);
    this.flagIndex_ = new FlagIndex(this);
    this.notifications_ = new Notifications(localPlayer);

    this.chatView_ = new Chat(this);
    this.chatView_.addSystemMessage('Welcome to dotproduct! Press ? for help.');
    this.scoreboardView_ = new Scoreboard(this);
    this.debugView_ = new Debug(this, this.viewport_);
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
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_POSITION, this.onPlayerPosition_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_DIED, this.onPlayerDied_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.CHAT_MESSAGE, this.onChatMessage_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.SHIP_CHANGE, this.onShipChanged_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.SCORE_UPDATE, this.onScoreUpdated_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PRIZE_SEED_UPDATE, this.onPrizeSeedUpdated_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PRIZE_COLLECTED, this.onPrizeCollected_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.SET_PRESENCE, this.onSetPresence_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.FLAG_UPDATE, this.onFlagUpdate_.bind(this));
    this.protocol_.startGame(this.simulation_, startingShip);

    this.viewport_.followPlayer(localPlayer);

    Listener.add(localPlayer, 'shipchange', this.onLocalPlayerShipChanged_.bind(this));
    Listener.add(localPlayer, 'collect_prize', this.onLocalPlayerCollectedPrize_.bind(this));
    Listener.add(localPlayer, 'death', this.onLocalPlayerDied_.bind(this));

    Listener.add(this.keyboard_, Key.Code.ESCAPE, this.onEscapePressed_.bind(this));
    Listener.add(this.keyboard_, Key.Code.QUESTION_MARK, this.onHelp_.bind(this));

    window.addEventListener('resize', this.onResize_.bind(this));
    window.addEventListener('focus', function () { localPlayer.clearPresence(Player.Presence.AWAY); });
    window.addEventListener('blur', function () { localPlayer.setPresence(Player.Presence.AWAY); });
    this.canvas_.addEventListener('mousemove', this.onMouseMoved_.bind(this));

    new Timer().setInterval(this.heartbeat_.bind(this), 100);
    Notification.requestPermission();

    // Make sure the game canvas is the right size and start rendering loop.
    (<HTMLDivElement> document.getElementById('game')).classList.add('in-game');
    this.onResize_();
    this.renderingLoop_();
  }

  public getSimulation() : Simulation {
    return this.simulation_;
  }

  public getPainter() : Painter {
    return this.painter_;
  }

  public getProtocol() : Protocol {
    return this.protocol_;
  }

  public getKeyboard() : Keyboard {
    return this.keyboard_;
  }

  public getMouse() : Mouse {
    return this.mouse_;
  }

  public getNotifications() : Notifications {
    return this.notifications_;
  }

  public getResourceManager() : ResourceManager {
    return this.resourceManager_;
  }

  public getSettings() : Object {
    return this.settings_;
  }

  public getMap() : Map {
    return this.map_;
  }

  public getPlayerIndex() : PlayerIndex {
    return this.playerIndex_;
  }

  public getPrizeIndex() : PrizeIndex {
    return this.prizeIndex_;
  }

  public getFlagIndex() : FlagIndex {
    return this.flagIndex_;
  }

  public getModelObjectFactory() : ModelObjectFactory {
    return this.modelObjectFactory_;
  }

  public getViewport() : Viewport {
    return this.viewport_;
  }

  private heartbeat_() {
    // Keep the game running even if we're in the background.
    var curTime = Date.now();
    while (curTime - this.lastTime_ > 500) {
      cancelAnimationFrame(this.animationId_);
      this.renderingLoop_();
    }
  }

  private renderingLoop_() {
    this.animationId_ = requestAnimationFrame(this.renderingLoop_.bind(this));

    var curTime = Date.now();
    var timeDiff = Timer.millisToTicks(curTime - this.lastTime_ + this.tickResidue_);

    timeDiff = Math.min(timeDiff, Game.MAX_TICKS_PER_FRAME_);

    for (var i = 0; i < timeDiff; ++i) {
      this.simulation_.advanceTime();
    }

    this.viewport_.update();

    this.painter_.render(this.viewport_);

    this.scoreboardView_.update();
    this.debugView_.update();

    this.tickResidue_ += curTime - this.lastTime_;
    this.tickResidue_ -= Timer.ticksToMillis(timeDiff);
    this.lastTime_ = curTime;
  }

  private onConnectionLost_() {
    var self = this;
    this.renderingLoop_ = function () { self.lastTime_ = Date.now(); };
    this.disconnectedView_.show();
  }

  private onPlayerEntered_(packet : Array<any>) {
    var id = packet[0];
    var name = packet[1];
    var team = packet[2];
    var isAlive = packet[3];
    var ship = packet[4];
    var bounty = packet[5];
    var presence = <Player.Presence> (packet[6]);

    var player = this.modelObjectFactory_.newRemotePlayer(this, id, name, team, isAlive, ship, bounty);
    player.setPresence(presence);
    this.playerIndex_.addPlayer(player);

    this.notifications_.addEnterMessage('Player entered: ' + name);
  }

  private onPlayerLeft_(packet : Array<any>) {
    var id = packet[0];
    var player = this.playerIndex_.findById(id);
    if (player) {
      this.playerIndex_.removePlayer(player);
      this.notifications_.addEnterMessage('Player left: ' + player.getName());
    }
  }

  private onPlayerPosition_(packet : Array<any>) {
    var timeDiff = Timer.millisToTicks(this.protocol_.getMillisSinceServerTime(packet[0]));
    var id = packet[1];
    var angle = packet[2];
    var position = new Vector(packet[3], packet[4]);
    var velocity = new Vector(packet[5], packet[6]);
    var isSafe = packet[7];

    // If the packet is really old, just discard it entirely. We should be getting
    // an updated one soon anyway. It may be the case that we discard a weapon
    // packet, but the remote player is lagging so their experience will be
    // degraded but everyone else's will be fine.
    if (timeDiff >= Game.MAX_TICKS_PER_FRAME_) {
      return;
    }

    var player = this.playerIndex_.findById(id);
    if (player) {
      (<RemotePlayer> player).onPositionUpdate(timeDiff, angle, position, velocity, isSafe);
      if (packet.length > 8) {
        player.onWeaponFired(timeDiff, position, velocity, packet[8]);
      }
    }
  }

  private onPlayerDied_(packet : Array<any>) {
    var x = packet[0];
    var y = packet[1];
    var killee = this.playerIndex_.findById(packet[2]);
    var killer = this.playerIndex_.findById(packet[3]);
    var bountyGained = packet[4];

    if (!killer || !killee) {
      return;
    }

    killee.onDeath(killer);
    killer.onKill(killee, bountyGained);
    this.prizeIndex_.addKillPrize(x, y);

    var message = killee.getName() + '(' + bountyGained + ') killed by: ' + killer.getName()
    if (killer == this.playerIndex_.getLocalPlayer()) {
      this.notifications_.addPersonalMessage(message);
    } else {
      this.notifications_.addMessage(message);
    }
  }

  private onShipChanged_(packet : Array<any>) {
    var player = this.playerIndex_.findById(packet[0]);
    var ship = packet[1];

    if (player) {
      player.setShip(ship);
    }
  }

  private onChatMessage_(packet : Array<any>) {
    var playerId = packet[0];
    var message = packet[1];

    if (playerId == Player.SYSTEM_PLAYER_ID) {
      this.chatView_.addSystemMessage(message);
    } else {
      var player = this.playerIndex_.findById(packet[0]);
      if (player) {
        this.chatView_.addMessage(player, message);
      }
    }
  }

  private onScoreUpdated_(packet : Array<any>) {
    var player = this.playerIndex_.findById(packet[0]);
    var points = packet[1];
    var wins = packet[2];
    var losses = packet[3];

    if (player) {
      player.onScoreUpdate(points, wins, losses);
    }
  }

  private onPrizeSeedUpdated_(packet : Array<any>) {
    var seed = packet[0];
    var timeDeltaMillis = this.protocol_.getMillisSinceServerTime(packet[1]);

    var ticks = Timer.millisToTicks(timeDeltaMillis);
    this.prizeIndex_.onSeedUpdate(seed, ticks);
  }

  private onPrizeCollected_(packet : Array<any>) {
    var player = this.playerIndex_.findById(packet[0]);
    var type = packet[1];
    var xTile = packet[2];
    var yTile = packet[3];

    // Remove the prize from the map if we have it in our model.
    var prize = this.prizeIndex_.getPrize(xTile, yTile);
    if (prize) {
      this.prizeIndex_.removePrize(prize);
    }

    if (player) {
      // Let the player collect the prize, even if it wasn't on the map (this makes
      // sure the bounty gets updated correctly for remote players even if our model
      // doesn't have a prize at that location).
      player.onPrizeCollected(prize);
    }
  }

  private onSetPresence_(packet : Array<any>) {
    var player = this.playerIndex_.findById(packet[0]);
    var presence = <Player.Presence> packet[1];
    if (player) {
      player.clearPresence(Player.Presence.ALL);
      player.setPresence(presence);
    }
  }

  private onFlagUpdate_(packet : Array<any>) {
    var id = packet[0];
    var team = packet[1];
    var xTile = packet[2];
    var yTile = packet[3];

    this.flagIndex_.updateFlag(id, team, xTile, yTile);
  }

  private onLocalPlayerShipChanged_(player : Player, shipType : number) {
    this.protocol_.sendShipChange(shipType);
  }

  private onLocalPlayerDied_(player : Player, killer : Player) {
    var x = player.getPosition().x;
    var y = player.getPosition().y;

    this.notifications_.addPersonalMessage('You were killed by ' + killer.getName() + '!');
    this.prizeIndex_.addKillPrize(x, y);
    this.protocol_.sendDeath(player.getPosition(), killer);
  }

  // Event handler for when the local player picks up a prize. Notify the server
  // if the prize was granted by the local simulation (i.e. prize is not null).
  private onLocalPlayerCollectedPrize_(player : Player, prize? : Prize) {
    if (!prize) {
      return;
    }

    this.protocol_.sendPrizeCollected(prize.getType(), prize.getX(), prize.getY());
    var message;
    switch (prize.getType()) {
      case PrizeType.NONE:
        message = 'No prize for you. Sadface.';
        break;
      case PrizeType.GUN_UPGRADE:
        message = 'Guns upgraded.';
        break;
      case PrizeType.BOMB_UPGRADE:
        message = 'Bombs upgraded.';
        break;
      case PrizeType.FULL_ENERGY:
        message = 'Full charge.';
        break;
      case PrizeType.BOUNCING_BULLETS:
        message = 'Bouncing bullets.';
        break;
      case PrizeType.MULTIFIRE:
        message = 'Multifire bullets.';
        break;
      default:
        assert(false, 'Unhandled prize type: ' + prize.getType());
    }

    if (message) {
      this.notifications_.addMessage(message);
    }
  }

  private onEscapePressed_() {
    if (!this.chatView_.isChatBoxVisible()) {
      (<HTMLElement> document.getElementById('help')).classList.remove('help-visible');
    }
  }

  private onHelp_() {
    if (!this.chatView_.isChatBoxVisible()) {
      (<HTMLElement> document.getElementById('help')).classList.toggle('help-visible');
    }
  }

  private onMouseMoved_(event) {
    if (event.offsetX < 10) {
      this.scoreboardView_.show();
    } else {
      this.scoreboardView_.hide();
    }
  }

  private onResize_ = function () {
    var width = window.innerWidth - this.canvas_.parentNode.offsetLeft;
    var height = window.innerHeight - this.canvas_.parentNode.offsetTop;

    var ratio = this.viewport_.getHdpiRatio();

    this.canvas_.width = width * ratio;
    this.canvas_.height = height * ratio;

    this.canvas_.style.width = width + 'px';
    this.canvas_.style.height = height + 'px';

    var context = this.canvas_.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.scale(ratio, ratio);

    // The chat window goes to the left of the radar.
    var size = RadarLayer.sizeForViewport(this.viewport_);
    this.chatView_.setRightPosition(size.width);
  }
}
