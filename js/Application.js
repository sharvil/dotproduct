/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Application');

goog.require('goog.debug.Console');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');

goog.require('html5.Fullscreen');

goog.require('dotprod.Game');
goog.require('dotprod.net.Protocol');
goog.require('dotprod.ResourceManager');
goog.require('dotprod.Timestamp');
goog.require('dotprod.views.LoadingView');
goog.require('dotprod.views.LoginView');

/**
 * @constructor
 * @param {!Object} settings
 * @param {string} url The WebSocket URL to connect to.
 */
dotprod.Application = function(settings, url) {
  // Make sure all logging output goes to console.
  new goog.debug.Console().setCapturing(true);

  /**
   * @type {!dotprod.net.Protocol}
   * @private
   */
  this.protocol_ = new dotprod.net.Protocol(url);

  /**
   * @type {!dotprod.ResourceManager}
   * @private
   */
  this.resourceManager_ = new dotprod.ResourceManager();

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
   * @type {dotprod.Game}
   * @private
   */
  this.game_;

  /**
   * @type {!dotprod.views.LoginView}
   * @private
   */
  this.loginView_ = new dotprod.views.LoginView({ 'accessToken': settings.accessToken }, this.protocol_, goog.bind(this.startGame_, this));

  /**
   * @type {!dotprod.views.LoadingView}
   * @private
   */
  this.loadingView_ = new dotprod.views.LoadingView(this.resourceManager_, goog.bind(this.onLoadComplete_, this));
  this.loadingView_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.$('loading')));
  this.loadingView_.hide();

  this.loginView_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.$('login')));
  this.loginView_.show();

  /**
   * @type {!HTMLElement}
   * @private
   */
  // this.fullscreenToggle_ = /** @type {!HTMLElement} */ (goog.dom.$('fullscreenToggle'));
  // this.fullscreenToggle_.style.display = (window == window.top) ? '' : 'none';
  // goog.events.listen(this.fullscreenToggle_, goog.events.EventType.CLICK, goog.bind(this.onFullscreenToggleClicked_, this));
};

/**
 * @param {!Object.<string, !Object>} resources
 * @param {!Object} settings
 * @param {!Object.<number, number>} mapData
 */
dotprod.Application.prototype.startGame_ = function(resources, settings, mapData) {
  this.settings_ = settings;
  this.mapData_ = mapData;

  this.loginView_.hide();
  this.loadingView_.show();
  this.loadingView_.load(resources);
};

dotprod.Application.prototype.onLoadComplete_ = function() {
  this.loadingView_.hide();

  this.game_ = new dotprod.Game(this.protocol_, this.resourceManager_, this.settings_, this.mapData_);
  this.game_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.$('game')));
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
dotprod.Application.prototype.onFullscreenToggleClicked_ = function(event) {
  if (!html5.Fullscreen.isFullscreen()) {
    html5.Fullscreen.request(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    html5.Fullscreen.cancel();
  }
};

var _main = function() {
  var settings = window.toObject(window.location.hash.substr(1));
  new dotprod.Application(settings, 'ws://' + window.location.host + '/dotproduct/v1/');
  window.location.hash = '';
};
