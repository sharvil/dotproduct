/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Application');

goog.require('goog.debug.Console');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('dotprod.Game');
goog.require('dotprod.Protocol');
goog.require('dotprod.ResourceManager');
goog.require('dotprod.views.LoadingView');
goog.require('dotprod.views.LoginView');

goog.require('dotprod.Prng');

/**
 * @constructor
 * @param {!Object} settings
 */
dotprod.Application = function(settings) {
  // Make sure all logging output goes to console.
  new goog.debug.Console().setCapturing(true);

  /**
   * @type {!dotprod.Protocol}
   * @private
   */
  this.protocol_ = new dotprod.Protocol(settings['url']);

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
  this.fullscreenToggle_ = /** @type {!HTMLElement} */ (goog.dom.$('fullscreenToggle'));
  this.fullscreenToggle_.style.display = (window == window.top) ? '' : 'none';
  goog.events.listen(this.fullscreenToggle_, goog.events.EventType.CLICK, goog.bind(this.onFullscreenToggleClicked_, this));
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
  if (!document.mozFullScreen && !document.webkitIsFullScreen) {
    if (document.body.mozRequestFullScreen) {
      document.body.mozRequestFullScreen();
    } else {
      document.body.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else {
      document.webkitCancelFullScreen();
    }
  }
};

var _main = function() {
  var settings = dotprod.QueryString.toObject(window.location.hash.substr(1));
  settings['url'] = 'ws://' + window.location.host + '/dotproduct/v1/';
  window.location.hash = '';
  new dotprod.Application(settings);
};
