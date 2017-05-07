import FlagList from 'model/FlagList';
import Flag from 'model/Flag';
import Map from 'model/Map';
import ModelObject from 'model/ModelObject';
import ModelObjectFactory from 'model/ModelObjectFactory';
import PlayerList from 'model/PlayerList';
import Player from 'model/player/Player';
import RemotePlayer from 'model/player/RemotePlayer';
import PrizeList from 'model/PrizeList';
import Prize from 'model/Prize';
import Timer from 'time/Timer';
import Protocol from 'net/Protocol';
import Listener from 'Listener';
import Vector from 'math/Vector';

export default class Simulation {
  public static readonly MAX_TICKS_PER_FRAME : number = 150;

  // State used to move simulation forward.
  private modelObjectFactory_ : ModelObjectFactory;
  private registeredObjects_ : Array<ModelObject>;
  private timeMillis_ : number;

  // Event sources for simulation.
  private protocol_ : Protocol;

  // Simulation model state.
  private map_ : Map;
  private playerList_ : PlayerList;
  private flagList_ : FlagList;
  private prizeList_: PrizeList;
  private settings_ : Object;

  constructor(modelObjectFactory : ModelObjectFactory, protocol : Protocol, settings : Object, mapData : any, tileProperties : Array<Object>) {
    this.modelObjectFactory_ = modelObjectFactory;
    this.registeredObjects_ = [];
    this.timeMillis_ = 0;

    this.protocol_ = protocol;
    this.settings_ = settings;
    this.map_ = new Map(settings, mapData, tileProperties);

    let startingShip = Math.floor(Math.random() * settings['ships'].length);
    let localPlayer = this.modelObjectFactory_.newLocalPlayer(this, settings['id'], settings['name'], settings['team'], startingShip);
    this.playerList_ = new PlayerList(localPlayer);

    this.flagList_ = new FlagList(this, this.map_);
    this.prizeList_ = new PrizeList(this, settings, this.map_);

    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_ENTERED, this.onPlayerEntered_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_LEFT, this.onPlayerLeft_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_POSITION, this.onPlayerPosition_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_DIED, this.onPlayerDied_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.SHIP_CHANGE, this.onShipChanged_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.SCORE_UPDATE, this.onScoreUpdated_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PRIZE_SEED_UPDATE, this.onPrizeSeedUpdated_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PRIZE_COLLECTED, this.onPrizeCollected_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.SET_PRESENCE, this.onSetPresence_.bind(this));
    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.FLAG_UPDATE, this.onFlagUpdate_.bind(this));

    Listener.add(localPlayer, 'positionchange', this.onLocalPlayerPositionChanged_.bind(this));
    Listener.add(localPlayer, 'shipchange', this.onLocalPlayerShipChanged_.bind(this));
    Listener.add(localPlayer, 'presencechange', this.onLocalPlayerPresenceChanged_.bind(this));
    Listener.add(localPlayer, 'collect_prize', this.onLocalPlayerCollectedPrize_.bind(this));
    Listener.add(localPlayer, 'capture_flag', this.onLocalPlayerCapturedFlag_.bind(this));
    Listener.add(localPlayer, 'death', this.onLocalPlayerDied_.bind(this));
  }

  public registerObject(obj : ModelObject) {
    assert(obj.isValid(), 'Cannot register an invalid object.');
    this.registeredObjects_.push(obj);
  }

  public unregisterObject(obj : ModelObject) {
    this.registeredObjects_.remove(obj);
  }

  public advanceTime() {
    // Start counting time from the first tick of the simulation instead of
    // when this object was constructed. Doing it this way makes sure we don't
    // have a clock bias due to the delay from object construction -> first tick.
    if (!this.timeMillis_) {
      this.timeMillis_ = Date.now();
    } else {
      this.timeMillis_ += Timer.ticksToMillis(1);
    }

    let objectSnapshot = Array.from(this.registeredObjects_);
    objectSnapshot.forEach(function (obj) {
      obj.advanceTime();
    });
  }

  public getTimeMillis() : number {
    return this.timeMillis_;
  }

  // Network events that update simulation state.

  private onPlayerEntered_(packet: Array<any>) {
    let id = packet[0];
    let name = packet[1];
    let team = packet[2];
    let isAlive = packet[3];
    let ship = packet[4];
    let bounty = packet[5];
    let presence = <Player.Presence>(packet[6]);

    let player = this.modelObjectFactory_.newRemotePlayer(id, name, team, isAlive, ship, bounty);
    player.setPresence(presence);
    this.playerList_.addPlayer(player);
  }

  private onPlayerLeft_(packet: Array<any>) {
    let id = packet[0];
    let player = this.playerList_.findById(id);
    if (player) {
      this.playerList_.removePlayer(player);
    }
  }

  private onPlayerPosition_(packet: Array<any>) {
    let timeDiff = Timer.millisToTicks(this.protocol_.getMillisSinceServerTime(packet[0]));
    let id = packet[1];
    let angle = packet[2];
    let position = new Vector(packet[3], packet[4]);
    let velocity = new Vector(packet[5], packet[6]);
    let isSafe = packet[7];

    // If the packet is really old, just discard it entirely. We should be getting
    // an updated one soon anyway. It may be the case that we discard a weapon
    // packet, but the remote player is lagging so their experience will be
    // degraded but everyone else's will be fine.
    if (timeDiff >= Simulation.MAX_TICKS_PER_FRAME) {
      return;
    }

    let player = this.playerList_.findById(id);
    if (player) {
      (<RemotePlayer>player).onPositionUpdate(timeDiff, angle, position, velocity, isSafe);
      if (packet.length > 8) {
        player.onWeaponFired(timeDiff, position, velocity, packet[8]);
      }
    }
  }

  private onPlayerDied_(packet: Array<any>) {
    let x = packet[0];
    let y = packet[1];
    let killee = this.playerList_.findById(packet[2]);
    let killer = this.playerList_.findById(packet[3]);
    let bountyGained = packet[4];

    if (!killer || !killee) {
      return;
    }

    killee.onDeath(killer);
    killer.onKill(killee, bountyGained);
    this.prizeList_.addKillPrize(x, y);
  }

  private onShipChanged_(packet: Array<any>) {
    let player = this.playerList_.findById(packet[0]);
    let ship = packet[1];

    if (player) {
      player.ship = ship;
    }
  }

  private onScoreUpdated_(packet: Array<any>) {
    let player = this.playerList_.findById(packet[0]);
    let points = packet[1];
    let wins = packet[2];
    let losses = packet[3];

    if (player) {
      player.onScoreUpdate(points, wins, losses);
    }
  }

  private onPrizeSeedUpdated_(packet: Array<any>) {
    let seed = packet[0];
    let timeDeltaMillis = this.protocol_.getMillisSinceServerTime(packet[1]);

    let ticks = Timer.millisToTicks(timeDeltaMillis);
    this.prizeList_.onSeedUpdate(seed, ticks);
  }

  private onPrizeCollected_(packet: Array<any>) {
    let player = this.playerList_.findById(packet[0]);
    let type = packet[1];
    let xTile = packet[2];
    let yTile = packet[3];

    // Remove the prize from the map if we have it in our model.
    let prize = this.prizeList_.getPrize(xTile, yTile);
    if (prize) {
      this.prizeList_.removePrize(prize);
    }

    if (player) {
      // Let the player collect the prize, even if it wasn't on the map (this makes
      // sure the bounty gets updated correctly for remote players even if our model
      // doesn't have a prize at that location).
      player.onPrizeCollected(prize);
    }
  }

  private onSetPresence_(packet: Array<any>) {
    let player = this.playerList_.findById(packet[0]);
    let presence = <Player.Presence>packet[1];
    if (player) {
      player.clearPresence(Player.Presence.ALL);
      player.setPresence(presence);
    }
  }

  private onFlagUpdate_(packet: Array<any>) {
    let id = packet[0];
    let team = packet[1];
    let xTile = packet[2];
    let yTile = packet[3];

    this.flagList_.updateFlag(id, team, xTile, yTile);
  }

  // Events on the local player

  private onLocalPlayerPositionChanged_(player: Player, data: any) {
    this.protocol_.sendPosition(data.angle, data.position, data.velocity, data.isSafe, data.weaponData);
  }

  private onLocalPlayerShipChanged_(player: Player, shipType: number) {
    this.protocol_.sendShipChange(shipType);
  }

  private onLocalPlayerPresenceChanged_(player: Player, presence: number) {
    this.protocol_.sendSetPresence(presence);
  }

  private onLocalPlayerCapturedFlag_(player: Player, flag: Flag) {
    this.protocol_.sendFlagCaptured(flag.getId());
  }

  private onLocalPlayerDied_(player: Player, killer: Player) {
    let x = player.getPosition().x;
    let y = player.getPosition().y;

    this.prizeList_.addKillPrize(x, y);
    this.protocol_.sendDeath(player.getPosition(), killer);
  }

  private onLocalPlayerCollectedPrize_(player: Player, prize?: Prize) {
    if (!prize) {
      return;
    }

    this.protocol_.sendPrizeCollected(prize.getType(), prize.getX(), prize.getY());
  }

  public get modelObjectFactory() : ModelObjectFactory { return this.modelObjectFactory_; }
  public get map() : Map { return this.map_; }
  public get playerList(): PlayerList { return this.playerList_; }
  public get flagList() : FlagList { return this.flagList_; }
  public get prizeList() : PrizeList { return this.prizeList_; }
  public get settings() : Object { return this.settings_; }
}
