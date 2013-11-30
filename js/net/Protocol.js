/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.net.Protocol');
goog.provide('dotprod.net.Protocol.S2CPacketType');

goog.require('goog.debug.Logger');

goog.require('dotprod.math.Vector');
goog.require('dotprod.model.projectile.Projectile');
goog.require('dotprod.Timer');

/**
 * @constructor
 * @param {string} url The server URL to connect to.
 */
dotprod.net.Protocol = function(url) {
  /**
   * @type {!goog.debug.Logger}
   * @private
   */
  this.logger_ = goog.debug.Logger.getLogger('dotprod.net.Protocol');

  /**
   * @type {string}
   * @private
   */
  this.url_ = url;

  /**
   * @type {WebSocket}
   * @private
   */
  this.socket_ = null;

  /**
   * @type {!Array.<string>}
   * @private
   */
  this.packetQueue_ = [];

  /**
   * @type {!Object.<dotprod.net.Protocol.S2CPacketType, !Array.<function(!Array)>>}
   * @private
   */
  this.handlers_ = {};
  for (var i in dotprod.net.Protocol.S2CPacketType) {
    this.handlers_[dotprod.net.Protocol.S2CPacketType[i]] = [];
  }

  /**
   * @type {number}
   * @private
   */
  this.syncTimer_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.serverTimeDelta_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.roundTripTime_ = 0;

  this.registerHandler(dotprod.net.Protocol.S2CPacketType.CLOCK_SYNC_REPLY, goog.bind(this.onClockSyncReply_, this));
};

/**
 * @type {string}
 * @private
 */
dotprod.net.Protocol.PROTOCOL_VERSION_ = 'dotproduct.v1';

/**
 * @enum {number}
 * @private
 */
dotprod.net.Protocol.C2SPacketType_ = {
  LOGIN: 1,
  START_GAME: 2,
  POSITION: 3,
  CLOCK_SYNC: 4,
  PLAYER_DIED: 5,
  CHAT_MESSAGE: 6,
  SHIP_CHANGE: 7,
  QUERY_NAME: 8,
  REGISTER_NAME: 9,
  PRIZE_COLLECTED: 10,
  SET_PRESENCE: 11,
  TUTORIAL_COMPLETED: 12,
  FLAG_CAPTURED: 13
};

/**
 * @enum {number}
 */
dotprod.net.Protocol.S2CPacketType = {
  LOGIN_REPLY: 1,
  PLAYER_ENTERED: 2,
  PLAYER_LEFT: 3,
  PLAYER_POSITION: 4,
  CLOCK_SYNC_REPLY: 5,
  PLAYER_DIED: 6,
  CHAT_MESSAGE: 7,
  SHIP_CHANGE: 8,
  SCORE_UPDATE: 9,
  QUERY_NAME_REPLY: 10,
  REGISTER_NAME_REPLY: 11,
  PRIZE_SEED_UPDATE: 12,
  PRIZE_COLLECTED: 13,
  SET_PRESENCE: 14,
  FLAG_UPDATE: 15
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.net.Protocol.CLOCK_SYNC_PERIOD_ = 2000;

/**
 * @param {number} timestamp
 * @return {number} The number of milliseconds elapsed since the specified server timestamp.
 */
dotprod.net.Protocol.prototype.getMillisSinceServerTime = function(timestamp) {
  var diff = timestamp - this.serverTimeDelta_;
  if (diff < 0) {
    diff += 0x100000000;
  }
  diff = this.asUint32_(goog.now()) - diff;
  if (diff < 0) {
    diff += 0x100000000;
  }
  return diff;
};

/**
 * @return {number}
 */
dotprod.net.Protocol.prototype.getRoundTripTime = function() {
  return this.roundTripTime_;
};

/**
 * @param {dotprod.net.Protocol.S2CPacketType} packetType
 * @param {function(!Object)} cb
 */
dotprod.net.Protocol.prototype.registerHandler = function(packetType, cb) {
  this.handlers_[packetType].push(cb);
};

/**
 * @param {!Object} loginData
 */
dotprod.net.Protocol.prototype.login = function(loginData) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.LOGIN, loginData]);
};

/**
 * @param {number} ship
 */
dotprod.net.Protocol.prototype.startGame = function(ship) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.START_GAME, ship]);
  this.syncClocks_();
  this.syncTimer_ = dotprod.Timer.setInterval(goog.bind(this.syncClocks_, this), dotprod.net.Protocol.CLOCK_SYNC_PERIOD_);
};

/**
 * @param {number} direction
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {boolean} isSafe
 * @param {Object=} opt_weaponData
 */
dotprod.net.Protocol.prototype.sendPosition = function(direction, position, velocity, isSafe, opt_weaponData) {
  var packet = [dotprod.net.Protocol.C2SPacketType_.POSITION, this.asRemoteTime_(goog.now()), direction, position.getX(), position.getY(), velocity.getX(), velocity.getY(), isSafe];
  if (opt_weaponData) {
    packet.push(opt_weaponData);
  }
  this.send_(packet);
};

dotprod.net.Protocol.prototype.syncClocks_ = function() {
  this.send_([dotprod.net.Protocol.C2SPacketType_.CLOCK_SYNC, this.asUint32_(goog.now())]);
};

/**
 * @param {!Object} packet
 * @private
 */
dotprod.net.Protocol.prototype.onClockSyncReply_ = function(packet) {
  var clientTime0 = packet[0];
  var serverTime = packet[1];
  var rtt = this.asUint32_(goog.now()) - clientTime0;

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
};

/**
 * @param {!dotprod.math.Vector} position The position of the local player at the time of death.
 * @param {!dotprod.model.player.Player} killer
 */
dotprod.net.Protocol.prototype.sendDeath = function(position, killer) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.PLAYER_DIED, this.asRemoteTime_(goog.now()), position.getX(), position.getY(), killer.getId()]);
};

/**
 * @param {string} message
 */
dotprod.net.Protocol.prototype.sendChat = function(message) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.CHAT_MESSAGE, message]);
};

/**
 * @param {number} ship
 */
dotprod.net.Protocol.prototype.sendShipChange = function(ship) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.SHIP_CHANGE, ship]);
};

/**
 * @param {string} name
 */
dotprod.net.Protocol.prototype.queryName = function(name) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.QUERY_NAME, name]);
};

/**
 * @param {string} name
 */
dotprod.net.Protocol.prototype.registerName = function(name) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.REGISTER_NAME, name]);
};

/**
 * @param {number} type
 * @param {number} x
 * @param {number} y
 */
dotprod.net.Protocol.prototype.sendPrizeCollected = function(type, x, y) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.PRIZE_COLLECTED, type, x, y]);
};

/**
 * @param {dotprod.model.player.Player.Presence} presence
 */
dotprod.net.Protocol.prototype.sendSetPresence = function(presence) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.SET_PRESENCE, presence]);
};

/**
 * @param {number} id
 */
dotprod.net.Protocol.prototype.sendFlagCaptured = function(id) {
  this.send_([dotprod.net.Protocol.C2SPacketType_.FLAG_CAPTURED, this.asRemoteTime_(goog.now()), id]);
};

dotprod.net.Protocol.prototype.onOpen_ = function() {
  for (var i = 0; i < this.packetQueue_.length; ++i) {
    this.socket_.send(this.packetQueue_[i]);
  }

  this.packetQueue_ = [];
};

dotprod.net.Protocol.prototype.onError_ = function() {
  // TODO(sharvil): drop connection, retry w/ binary exponential backoff
  this.logger_.warning('Error communicating with server.');
};

dotprod.net.Protocol.prototype.onClose_ = function() {
  dotprod.Timer.clearInterval(this.syncTimer_);
  this.syncTimer_ = 0;
  this.packetQueue_ = [];
  this.socket_ = null;

  // TODO(sharvil): retry connection w/ binary exponential backoff
  this.logger_.warning('Connection to server terminated.');
};

/**
 * @param {!goog.events.Event} event
 * @private
 */
dotprod.net.Protocol.prototype.onMessage_ = function(event) {
  var obj;
  try {
    var msg = /** @type {string} */ (event.getBrowserEvent().data);
    obj = window.JSON.parse(msg);
  } catch (e) {
    this.logger_.severe('Error parsing JSON: ' + event.getBrowserEvent().data + '\n' + e);
    return;
  }

  var packetHandlers = this.handlers_[obj[0]];
  if (packetHandlers) {
    var slicedObj = obj.slice(1);
    for (var i = 0; packetHandlers[i]; ++i) {
      packetHandlers[i](slicedObj);
    }
  } else {
    this.logger_.warning('Invalid packet from server: ' + obj);
  }
};

/**
 * @param {!Object} data
 * @private
 */
dotprod.net.Protocol.prototype.send_ = function(data) {
  var packet = window.JSON.stringify(data);

  this.createSocket_();

  if (this.socket_.readyState != this.socket_.OPEN) {
    this.packetQueue_.push(packet);
  } else {
    this.socket_.send(packet);
  }
};

dotprod.net.Protocol.prototype.createSocket_ = function() {
  if (this.socket_) {
    return;
  }

  this.socket_ = new WebSocket(this.url_, dotprod.net.Protocol.PROTOCOL_VERSION_);

  goog.events.listen(this.socket_, 'open', goog.bind(this.onOpen_, this));
  goog.events.listen(this.socket_, 'error', goog.bind(this.onError_, this));
  goog.events.listen(this.socket_, 'close', goog.bind(this.onClose_, this));
  goog.events.listen(this.socket_, 'message', goog.bind(this.onMessage_, this));
};

/**
 * @param {number} num
 * @return {number}
 * @private
 */
dotprod.net.Protocol.prototype.asUint32_ = function(num) {
  return num >>> 0;
};

/**
 * @return {number}
 */
dotprod.net.Protocol.prototype.asRemoteTime_ = function(timestamp) {
  return this.asUint32_(timestamp + this.serverTimeDelta_);
};
