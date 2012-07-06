/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Protocol');
goog.provide('dotprod.Protocol.S2CPacketType');

goog.require('goog.debug.Logger');
goog.require('dotprod.entities.Projectile');
goog.require('dotprod.Timer');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @param {string} url The server URL to connect to.
 */
dotprod.Protocol = function(url) {
  /**
   * @type {!goog.debug.Logger}
   * @private
   */
  this.logger_ = goog.debug.Logger.getLogger('dotprod.Protocol');

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
   * @type {!Object.<dotprod.Protocol.S2CPacketType, !Array.<function(!Array)>>}
   * @private
   */
  this.handlers_ = {};
  for (var i in dotprod.Protocol.S2CPacketType) {
    this.handlers_[dotprod.Protocol.S2CPacketType[i]] = [];
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

  this.registerHandler(dotprod.Protocol.S2CPacketType.CLOCK_SYNC_REPLY, goog.bind(this.onClockSyncReply_, this));
};

/**
 * @type {string}
 * @private
 */
dotprod.Protocol.PROTOCOL_VERSION_ = 'dotproduct.v1';

/**
 * @enum {number}
 * @private
 */
dotprod.Protocol.C2SPacketType_ = {
  LOGIN: 1,
  START_GAME: 2,
  POSITION: 3,
  CLOCK_SYNC: 4,
  PLAYER_DIED: 5,
  CHAT_MESSAGE: 6,
  SHIP_CHANGE: 7,
  QUERY_NAME: 8,
  REGISTER_NAME: 9,
  PRIZE_COLLECTED: 10
};

/**
 * @enum {number}
 */
dotprod.Protocol.S2CPacketType = {
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
  PRIZE_COLLECTED: 13
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.Protocol.CLOCK_SYNC_PERIOD_ = 2000;

/**
 * @param {number} timestamp
 * @return {number} The number of milliseconds elapsed since the specified server timestamp.
 */
dotprod.Protocol.prototype.getMillisSinceServerTime = function(timestamp) {
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
dotprod.Protocol.prototype.getRoundTripTime = function() {
  return this.roundTripTime_;
};

/**
 * @param {dotprod.Protocol.S2CPacketType} packetType
 * @param {function()} cb
 */
dotprod.Protocol.prototype.registerHandler = function(packetType, cb) {
  this.handlers_[packetType].push(cb);
};

/**
 * @param {!Object} loginData
 */
dotprod.Protocol.prototype.login = function(loginData) {
  this.send_([dotprod.Protocol.C2SPacketType_.LOGIN, loginData]);
};

/**
 * @param {number} ship
 */
dotprod.Protocol.prototype.startGame = function(ship) {
  this.send_([dotprod.Protocol.C2SPacketType_.START_GAME, ship]);
  this.syncClocks_();
  this.syncTimer_ = dotprod.Timer.setInterval(goog.bind(this.syncClocks_, this), dotprod.Protocol.CLOCK_SYNC_PERIOD_);
};

/**
 * @param {number} direction
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 * @param {!dotprod.entities.Projectile=} opt_projectile
 */
dotprod.Protocol.prototype.sendPosition = function(direction, position, velocity, opt_projectile) {
  var packet = [dotprod.Protocol.C2SPacketType_.POSITION, this.asRemoteTime_(goog.now()), direction, position.getX(), position.getY(), velocity.getX(), velocity.getY()];
  if (opt_projectile) {
    position = opt_projectile.getPosition();
    velocity = opt_projectile.getVelocity();
    packet = packet.concat([opt_projectile.getType(), opt_projectile.getLevel(), position.getX(), position.getY(), velocity.getX(), velocity.getY()]);
  }
  this.send_(packet);
};

/**
 * @param {number} type
 * @param {number} x
 * @param {number} y
 */
dotprod.Protocol.prototype.sendPrizeCollected = function(type, x, y) {
  this.send_([dotprod.Protocol.C2SPacketType_.PRIZE_COLLECTED, type, x, y]);
};

dotprod.Protocol.prototype.syncClocks_ = function() {
  this.send_([dotprod.Protocol.C2SPacketType_.CLOCK_SYNC, this.asUint32_(goog.now())]);
};

dotprod.Protocol.prototype.onClockSyncReply_ = function(packet) {
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
 * @param {string} killer
 */
dotprod.Protocol.prototype.sendDeath = function(killer) {
  this.send_([dotprod.Protocol.C2SPacketType_.PLAYER_DIED, this.asRemoteTime_(goog.now()), killer]);
};

/**
 * @param {string} message
 */
dotprod.Protocol.prototype.sendChat = function(message) {
  this.send_([dotprod.Protocol.C2SPacketType_.CHAT_MESSAGE, message]);
};

/**
 * @param {number} ship
 */
dotprod.Protocol.prototype.sendShipChange = function(ship) {
  this.send_([dotprod.Protocol.C2SPacketType_.SHIP_CHANGE, ship]);
};

/**
 * @param {string} name
 */
dotprod.Protocol.prototype.queryName = function(name) {
  this.send_([dotprod.Protocol.C2SPacketType_.QUERY_NAME, name]);
};

/**
 * @param {string} name
 */
dotprod.Protocol.prototype.registerName = function(name) {
  this.send_([dotprod.Protocol.C2SPacketType_.REGISTER_NAME, name]);
};

dotprod.Protocol.prototype.onOpen_ = function() {
  for (var i = 0; i < this.packetQueue_.length; ++i) {
    this.socket_.send(this.packetQueue_[i]);
  }

  this.packetQueue_ = [];
};

dotprod.Protocol.prototype.onError_ = function() {
  // TODO(sharvil): drop connection, retry w/ binary exponential backoff
  this.logger_.warning('Error communicating with server.');
};

dotprod.Protocol.prototype.onClose_ = function() {
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
dotprod.Protocol.prototype.onMessage_ = function(event) {
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
dotprod.Protocol.prototype.send_ = function(data) {
  var packet = window.JSON.stringify(data);

  this.createSocket_();

  if (this.socket_.readyState != this.socket_.OPEN) {
    this.packetQueue_.push(packet);
  } else {
    this.socket_.send(packet);
  }
};

dotprod.Protocol.prototype.createSocket_ = function() {
  if (this.socket_) {
    return;
  }

  this.socket_ = new WebSocket(this.url_, dotprod.Protocol.PROTOCOL_VERSION_);

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
dotprod.Protocol.prototype.asUint32_ = function(num) {
  return num >>> 0;
};

/**
 * @return {number}
 */
dotprod.Protocol.prototype.asRemoteTime_ = function(timestamp) {
  return this.asUint32_(timestamp + this.serverTimeDelta_);
};
