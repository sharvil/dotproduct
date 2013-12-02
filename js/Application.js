goog.provide('Application');

goog.require('goog.debug.Console');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');

goog.require('html5.Fullscreen');

goog.require('Game');
goog.require('net.Protocol');
goog.require('ResourceManager');
goog.require('Timestamp');
goog.require('views.LoadingView');
goog.require('views.LoginView');

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
   * @type {!views.LoginView}
   * @private
   */
  this.loginView_ = new views.LoginView({ 'accessToken': settings.accessToken }, this.protocol_, goog.bind(this.startGame_, this));

  /**
   * @type {!views.LoadingView}
   * @private
   */
  this.loadingView_ = new views.LoadingView(this.resourceManager_, goog.bind(this.onLoadComplete_, this));
  this.loadingView_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.getElement('loading')));
  this.loadingView_.hide();

  this.loginView_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.getElement('login')));
  this.loginView_.show();

  /**
   * @type {!HTMLElement}
   * @private
   */
  // this.fullscreenToggle_ = /** @type {!HTMLElement} */ (goog.dom.getElement('fullscreenToggle'));
  // this.fullscreenToggle_.style.display = (window == window.top) ? '' : 'none';
  // goog.events.listen(this.fullscreenToggle_, goog.events.EventType.CLICK, goog.bind(this.onFullscreenToggleClicked_, this));
};

/**
 * @param {!Object.<string, !Object>} resources
 * @param {!Object} settings
 * @param {!Object.<number, number>} mapData
 * @param {!Array.<!Object>} mapProperties
 */
Application.prototype.startGame_ = function(resources, settings, mapData, mapProperties) {
  this.settings_ = settings;
  this.mapData_ = mapData;
  this.mapProperties_ = mapProperties;

  this.loginView_.hide();
  this.loadingView_.show();
  this.loadingView_.load(resources);
};

Application.prototype.onLoadComplete_ = function() {
  this.loadingView_.hide();

  this.game_ = new Game(this.protocol_, this.resourceManager_, this.settings_, this.mapData_, this.mapProperties_);
  this.game_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.getElement('game')));
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
Application.prototype.onFullscreenToggleClicked_ = function(event) {
  if (!html5.Fullscreen.isFullscreen()) {
    html5.Fullscreen.request(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    html5.Fullscreen.cancel();
  }
};

var _main = function() {
  var settings = window.toObject(window.location.hash.substr(1));
  new Application(settings, 'ws://' + window.location.host + '/dotproduct/v1/');
  window.location.hash = '';
};
