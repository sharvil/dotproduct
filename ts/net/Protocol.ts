import Vector from 'math/Vector';
import Projectile from 'model/projectile/Projectile';
import Timer from 'time/Timer';
import Simulation from 'model/Simulation';
import Player from 'model/player/Player';

type PacketHandler = (packet : Array<any>) => void;

const enum C2SPacketType_ {
  LOGIN = 1,
  START_GAME,
  POSITION,
  CLOCK_SYNC,
  PLAYER_DIED,
  CHAT_MESSAGE,
  SHIP_CHANGE,
  PRIZE_COLLECTED,
  SET_PRESENCE,
  TUTORIAL_COMPLETED,
  FLAG_CAPTURED
}

class Protocol {
  private static readonly PROTOCOL_VERSION_ : string = 'dotproduct.v1';
  private static readonly CLOCK_SYNC_PERIOD_ : number = 2000;

  private socket_ : WebSocket;
  private packetQueue_ : Array<string>;
  private eventHandler_ : VoidFunction;
  private handlers_ : Map<Protocol.S2CPacketType, Array<PacketHandler>>;
  private syncTimer_ : number;
  private serverTimeDelta_ : number;
  private roundTripTime_ : number;
  private simulation_ : Simulation | null;

  constructor(url) {
    this.packetQueue_ = [];
    this.eventHandler_ = function() {};

    this.handlers_ = new Map<Protocol.S2CPacketType, Array<PacketHandler>>();
    for (var i = 0; i < 256; ++i) {
      this.handlers_[i] = [];
    }

    this.syncTimer_ = 0;
    this.serverTimeDelta_ = 0;
    this.roundTripTime_ = 0;
    this.simulation_ = null;

    this.socket_ = new WebSocket(url, Protocol.PROTOCOL_VERSION_);
    this.socket_.addEventListener('open', this.onOpen_.bind(this));
    this.socket_.addEventListener('error', this.onClose_.bind(this));
    this.socket_.addEventListener('close', this.onClose_.bind(this));
    this.socket_.addEventListener('message', this.onMessage_.bind(this));

    this.registerPacketHandler(Protocol.S2CPacketType.CLOCK_SYNC_REPLY, this.onClockSyncReply_.bind(this));
  }

  // Returns the number of milliseconds elapsed since the specified server timestamp.
  public getMillisSinceServerTime(timestamp : number) : number {
    if (!this.simulation_) {
      return 0;
    }

    var diff = timestamp - this.serverTimeDelta_;
    if (diff < 0) {
      diff += 0x100000000;
    }
    diff = this.asInt32_(this.simulation_.getTimeMillis()) - diff;
    if (diff < 0) {
      diff += 0x100000000;
    }
    return diff;
  }

  public getRoundTripTime() : number {
    return this.roundTripTime_;
  }

  public registerEventHandler(cb : VoidFunction) {
    this.eventHandler_ = cb;
  }

  public registerPacketHandler(packetType : Protocol.S2CPacketType, cb : (packet : Array<any>) => void) {
    this.handlers_[packetType].push(cb);
  }

  public login(loginData : Object) {
    this.send_([C2SPacketType_.LOGIN, loginData]);
  }

  public startGame(simulation : Simulation, ship : number) {
    this.simulation_ = simulation;
    this.send_([C2SPacketType_.START_GAME, ship]);
    this.syncClocks_();
    this.syncTimer_ = Timer.setInterval(this.syncClocks_.bind(this), Protocol.CLOCK_SYNC_PERIOD_);
  }

  public sendPosition = function(direction : number, position : Vector, velocity : Vector, isSafe : boolean, weaponData? : Object) {
    var packet = [C2SPacketType_.POSITION, this.remoteTime_(), direction, position.x, position.y, velocity.x, velocity.y, isSafe];
    if (weaponData) {
      packet.push(weaponData);
    }
    this.send_(packet);
  }

  private syncClocks_() {
    this.send_([C2SPacketType_.CLOCK_SYNC, this.asInt32_(Date.now())]);
  }

  private onClockSyncReply_ = function(packet : Array<any>) {
    var clientTime0 = packet[0];
    var serverTime = packet[1];
    var rtt = this.asInt32_(Date.now()) - clientTime0;

    // Correct for integer overflow since clock sync timestamps are fixed precision 32-bit integers.
    if (rtt < 0) {
      rtt += 0x100000000;
    }

    this.roundTripTime_ = rtt;

    // Assume 60% of RTT is C2S latency.
    this.serverTimeDelta_ = Math.floor(serverTime - clientTime0 - 0.6 * rtt);

    if (this.serverTimeDelta_ < 0) {
      this.serverTimeDelta_ += 0x100000000;
    }
  }

  // |position| is the position of the local player at the time of death.
  public sendDeath(position : Vector, killer : Player) {
    this.send_([C2SPacketType_.PLAYER_DIED, position.x, position.y, killer.getId()]);
  }

  public sendChat(message : string) {
    this.send_([C2SPacketType_.CHAT_MESSAGE, message]);
  }

  public sendShipChange(ship : number) {
    this.send_([C2SPacketType_.SHIP_CHANGE, ship]);
  }

  public sendPrizeCollected(type : number, x : number, y : number) {
    this.send_([C2SPacketType_.PRIZE_COLLECTED, type, x, y]);
  }

  public sendSetPresence(presence : Player.Presence) {
    this.send_([C2SPacketType_.SET_PRESENCE, presence]);
  }

  public sendFlagCaptured(id : number) {
    this.send_([C2SPacketType_.FLAG_CAPTURED, this.remoteTime_(), id]);
  }

  private onOpen_() {
    for (var i = 0; i < this.packetQueue_.length; ++i) {
      this.socket_.send(this.packetQueue_[i]);
    }

    this.packetQueue_ = [];
  };

  private onClose_() {
    Timer.clearInterval(this.syncTimer_);
    this.syncTimer_ = 0;
    this.packetQueue_ = [];

    this.eventHandler_();
  }

  private onMessage_(event : MessageEvent) {
    var obj;
    try {
      var msg = event.data;
      obj = JSON.parse(msg);
    } catch (e) {
      console.error('Error parsing JSON: ' + event.data + '\n' + e);
      return;
    }

    var packetHandlers = this.handlers_[obj[0]];
    if (packetHandlers) {
      var slicedObj = obj.slice(1);
      for (var i = 0; packetHandlers[i]; ++i) {
        packetHandlers[i](slicedObj);
      }
    } else {
      console.warn('Invalid packet from server: ' + obj);
    }
  }

  private send_(data : Object) {
    var packet = JSON.stringify(data);

    if (this.socket_.readyState != WebSocket.OPEN) {
      this.packetQueue_.push(packet);
    } else {
      this.socket_.send(packet);
    }
  }

  private asInt32_(num : number) : number {
    return num | 0;
  }

  private remoteTime_() : number {
    if (!this.simulation_) {
      return 0;
    }

    return this.asInt32_(this.simulation_.getTimeMillis() + this.serverTimeDelta_);
  }
}

namespace Protocol {
  export const enum S2CPacketType {
    LOGIN_REPLY = 1,
    PLAYER_ENTERED,
    PLAYER_LEFT,
    PLAYER_POSITION,
    CLOCK_SYNC_REPLY,
    PLAYER_DIED,
    CHAT_MESSAGE,
    SHIP_CHANGE,
    SCORE_UPDATE,
    PRIZE_SEED_UPDATE,
    PRIZE_COLLECTED,
    SET_PRESENCE,
    FLAG_UPDATE
  }
}

export default Protocol;
