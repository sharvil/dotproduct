goog.provide('views.LoginView');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('net.Protocol');
goog.require('net.Protocol.S2CPacketType');
goog.require('views.View');

/**
 * @constructor
 * @extends {views.View}
 * @param {!Object} loginData
 * @param {!net.Protocol} protocol
 * @param {function(!Object.<string, !Object>, !Object, !Object.<number, number>, !Array.<!Object>)} successCb
 */
views.LoginView = function(loginData, protocol, successCb) {
  goog.base(this);

  /**
   * @type {!net.Protocol}
   * @private
   */
  this.protocol_ = protocol;
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.LOGIN_REPLY, goog.bind(this.onLoginReply_, this));
  this.protocol_.login(loginData);

  /**
   * @type {function(!Object.<string, !Object>, !Object, !Object.<number, number>, !Array.<!Object>)}
   * @private
   */
  this.successCb_ = successCb;
};
goog.inherits(views.LoginView, views.View);

/**
 * @param {!Array} packet
 */
views.LoginView.prototype.onLoginReply_ = function(packet) {
  if (packet[0] == 1) {
    var resources = packet[1];
    var settings = packet[2];
    var mapData = packet[3];
    var mapProperties = packet[4];

    this.successCb_(resources, settings, mapData, mapProperties);
  } else {
    alert('Login failure: ' + packet[1]);
  }
};
