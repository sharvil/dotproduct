/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Application');

goog.require('goog.debug.Console');
goog.require('goog.dom');
goog.require('dotprod.Game');
goog.require('dotprod.Protocol');
goog.require('dotprod.QueryString');
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

  var loginData = {};
  for (var i in settings) {
    if (i.indexOf('openid.') == 0) {
      loginData[i] = settings[i];
    }
  }

  /**
   * @type {!dotprod.views.LoginView}
   * @private
   */
  this.loginView_ = new dotprod.views.LoginView(loginData, this.protocol_, goog.bind(this.startGame_, this));

  /**
   * @type {!dotprod.views.LoadingView}
   * @private
   */
  this.loadingView_ = new dotprod.views.LoadingView(this.resourceManager_, goog.bind(this.onLoadComplete_, this));
  this.loadingView_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.$('loading')));
  this.loadingView_.hide();

  this.loginView_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.$('login')));
  this.loginView_.show();
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

var _main = function(isOffline) {
  var settings = dotprod.QueryString.toObject(window.location.hash.substr(1));
  if (!settings['url']) {
    settings['url'] = isOffline ? 'ws://localhost:8000/dotproduct/v1/' : 'ws://dev.nanavati.net:8000/dotproduct/v1/';
  }
  window.location.hash = '';
  new dotprod.Application(settings);
};
