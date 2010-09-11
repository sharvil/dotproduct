/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Protocol');
goog.provide('dotprod.Protocol.S2CPacketType');

goog.require('goog.debug.Logger');
goog.require('goog.debug.Logger.Level');
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
};

/**
 * @enum {number}
 * @private
 */
dotprod.Protocol.C2SPacketType_ = {
  LOGIN: 1,
  BEGIN_GAME: 2,
  POSITION: 3
};

/**
 * @enum {number}
 */
dotprod.Protocol.S2CPacketType = {
  LOGIN_REPLY: 1,
  PLAYER_ENTERED: 2,
  PLAYER_LEFT: 3,
  PLAYER_POSITION: 4
};

/**
 * @param {dotprod.Protocol.S2CPacketType} packetType
 * @param {function()} cb
 */
dotprod.Protocol.prototype.registerHandler = function(packetType, cb) {
  this.handlers_[packetType].push(cb);
};

/**
 * @param {string} username
 */
dotprod.Protocol.prototype.login = function(username) {
  this.send_([dotprod.Protocol.C2SPacketType_.LOGIN, username]);
};

dotprod.Protocol.prototype.startGame = function() {
  this.send_([dotprod.Protocol.C2SPacketType_.BEGIN_GAME]);
};

/**
 * @param {number} direction
 * @param {dotprod.Vector} position
 * @param {dotprod.Vector} velocity
 */
dotprod.Protocol.prototype.sendPosition = function(direction, position, velocity) {
  this.send_([dotprod.Protocol.C2SPacketType_.POSITION, direction, position.getX(), position.getY(), velocity.getX(), velocity.getY()]);
};

dotprod.Protocol.prototype.onOpen_ = function() {
  for (var i in this.packetQueue_) {
    this.socket_.send(this.packetQueue_[i]);
  }

  this.packetQueue_ = [];
};

dotprod.Protocol.prototype.onError_ = function() {
  // TODO(sharvil): drop connection, retry w/ binary exponential backoff
  this.logger_.log(goog.debug.Logger.Level.WARNING, 'Error communicating with server.');
};

dotprod.Protocol.prototype.onClose_ = function() {
  this.packetQueue_ = [];
  this.socket_ = null;

  // TODO(sharvil): retry connection w/ binary exponential backoff
  this.logger_.log(goog.debug.Logger.Level.WARNING, 'Connection to server terminated.');
};

/**
 * @param {!goog.events.Event} event
 * @private
 */
dotprod.Protocol.prototype.onMessage_ = function(event) {
  var msg = /** @type {string} */ (event.getBrowserEvent().data);
  var obj = window.JSON.parse(msg);
  var packetHandlers = this.handlers_[obj[0]];

  if (packetHandlers) {
    var slicedObj = obj.slice(1);
    for (var i = 0; packetHandlers[i]; ++i) {
      packetHandlers[i](slicedObj);
    }
  } else {
    this.logger_.log(goog.debug.Logger.Level.WARNING, 'Invalid packet from server: ' + obj);
  }
};

/**
 * @param {!Object} data
 * @private
 */
dotprod.Protocol.prototype.send_ = function(data) {
  var packet = window.JSON.stringify(data);

  this.createSocket_();

  if (this.socket_.readyState != WebSocket.OPEN) {
    this.packetQueue_.push(packet);
  } else {
    this.socket_.send(packet);
  }
};

dotprod.Protocol.prototype.createSocket_ = function() {
  if (this.socket_) {
    return;
  }

  this.socket_ = new WebSocket(this.url_);

  goog.events.listen(this.socket_, 'open', goog.bind(this.onOpen_, this));
  goog.events.listen(this.socket_, 'error', goog.bind(this.onError_, this));
  goog.events.listen(this.socket_, 'close', goog.bind(this.onClose_, this));
  goog.events.listen(this.socket_, 'message', goog.bind(this.onMessage_, this));
}
