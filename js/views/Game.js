/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Game');

goog.require('goog.debug.ErrorHandler');
goog.require('goog.dom');
goog.require('dotprod.Camera');
goog.require('dotprod.GameConfig');
goog.require('dotprod.input.Keyboard');
goog.require('dotprod.layers.MapLayer');
goog.require('dotprod.sprites.Player');
goog.require('dotprod.Protocol');
goog.require('dotprod.ResourceManager');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Protocol} protocol
 * @param {!dotprod.GameConfig} gameConfig
 */
dotprod.Game = function(protocol, resourceManager, gameConfig) {
  /**
   * @type {!dotprod.Protocol}
   * @private
   */
  this.protocol_ = protocol;

  /**
   * @type {!dotprod.ResourceManager}
   * @private
   */
  this.resourceManager_ = resourceManager;

  /**
   * @type {!dotprod.GameConfig}
   * @private
   */
  this.gameConfig_ = gameConfig;

  /**
   * @type {!dotprod.input.Keyboard}
   * @private
   */
  this.keyboard_ = new dotprod.input.Keyboard();

  /**
   * @type {!HTMLCanvasElement}
   * @private
   */
  this.canvas_ = /** @type {!HTMLCanvasElement} */ (goog.dom.createElement('canvas'));
  this.canvas_.className = dotprod.Game.CANVAS_CLASS_NAME_;
  this.canvas_.width = 800;
  this.canvas_.height = 600;

  /**
   * @type {!dotprod.Camera}
   * @private
   */
  this.camera_ = new dotprod.Camera(this, this.canvas_.getContext('2d'))

  /**
   * @type {!dotprod.layers.MapLayer}
   * @private
   */
  this.mapLayer_ = new dotprod.layers.MapLayer(this);

  /**
   * @type {!dotprod.sprites.Player}
   * @private
   */
  this.player_ = new dotprod.sprites.Player(this, this.camera_, this.mapLayer_);

  /**
   * @type {number|null}
   * @private
   */
  this.intervalTimer_ = null;

  /**
   * @type {number}
   * @private
   */
  this.lastTime_ = goog.now();

  /**
   * @type {number}
   * @private
   */
  this.tickResidue_ = 0;
};
goog.inherits(dotprod.Game, dotprod.views.View);

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.Game.ANIMATION_PERIOD_ = 10;

/**
 * @const
 * @type {string}
 * @private
 */
dotprod.Game.CANVAS_CLASS_NAME_ = 'gv-map-canvas';

/**
 * @param {!HTMLDivElement} rootNode
 * @override
 */
dotprod.Game.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);
  rootNode.appendChild(this.canvas_);
};

dotprod.Game.prototype.start = function() {
  this.lastTime_ = goog.now();
  this.tickResidue_ = 0;
  this.intervalTimer_ = window.setInterval(goog.bind(this.renderingLoop_, this), dotprod.Game.ANIMATION_PERIOD_);
};

dotprod.Game.prototype.stop = function() {
  window.clearInterval(this.intervalTimer_);
  this.intervalTimer_ = null;
};

/**
 * @return {!dotprod.input.Keyboard}
 */
dotprod.Game.prototype.getKeyboard = function() {
  return this.keyboard_;
};

/**
 * @return {!dotprod.ResourceManager}
 */
dotprod.Game.prototype.getResourceManager = function() {
  return this.resourceManager_;
};

/**
 * @return {!dotprod.GameConfig}
 */
dotprod.Game.prototype.getConfig = function() {
  return this.gameConfig_;
};

/**
 * @private
 */
dotprod.Game.prototype.renderingLoop_ = function() {
  var curTime = goog.now();
  var timeDiff = Math.floor((curTime - this.lastTime_ + this.tickResidue_) / 10);

  this.mapLayer_.update(timeDiff);
  this.player_.update(timeDiff);

  this.mapLayer_.render(this.camera_);
  this.player_.render(this.camera_);

  this.tickResidue_ += curTime - this.lastTime_;
  this.tickResidue_ -= timeDiff * 10;
  this.lastTime_ = curTime;
};
