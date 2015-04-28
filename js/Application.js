goog.provide('Application');

goog.require('goog.debug.Console');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');

goog.require('Game');
goog.require('net.Protocol');
goog.require('net.Protocol.S2CPacketType');
goog.require('ResourceManager');
goog.require('ui.Loading');

/**
 * @constructor
 * @param {!Object} settings
 * @param {string} url The WebSocket URL to connect to.
 */
Application = function(settings, url) {
  // Make sure all logging output goes to console.
  new goog.debug.Console().setCapturing(true);

  /**
   * @type {!net.Protocol}
   * @private
   */
  this.protocol_ = new net.Protocol(url);

  /**
   * @type {!ResourceManager}
   * @private
   */
  this.resourceManager_ = new ResourceManager();

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = settings;

  /**
   * @type {!Object.<number, number>}
   * @private
   */
  this.mapData_ = {};

  /**
   * @type {Game}
   * @private
   */
  this.game_;

  /**
   * @type {!ui.Loading}
   * @private
   */
  this.loadingView_ = new ui.Loading(this.resourceManager_, this.onLoadComplete_.bind(this));

  var loginData = {
    'strategy': settings.strategy,
    'accessToken': settings.accessToken
  };

  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.LOGIN_REPLY, this.startGame_.bind(this));
  this.protocol_.login(loginData);
};

/**
 * @param {!Array} packet
 */
Application.prototype.startGame_ = function(packet) {
  if (packet[0] == 1) {
    var resources = packet[1];
    var settings = packet[2];
    var mapData = packet[3];
    var mapProperties = packet[4];

    this.settings_ = settings;
    this.mapData_ = mapData;
    this.mapProperties_ = mapProperties;

    this.loadingView_.load(resources);
  } else {
    alert('Login failure: ' + packet[1]);
  }
};

Application.prototype.onLoadComplete_ = function() {
  this.game_ = new Game(this.protocol_, this.resourceManager_, this.settings_, this.mapData_, this.mapProperties_);
};

var _main = function() {
  var settings = window.toObject(window.location.hash.substr(1));
  new Application(settings, 'ws://' + window.location.host + '/dotproduct/v1/');
  window.location.hash = '';
};
