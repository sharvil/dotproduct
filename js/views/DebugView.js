/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.DebugView');

goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Game} game
 */
dotprod.views.DebugView = function(game) {
  dotprod.views.View.call(this);

  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.latency_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.framerate_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.players_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.projectiles_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));

  /**
   * @type {number}
   * @private
   */
  this.lastTime_ = goog.now();

  /**
   * @type {number}
   * @private
   */
  this.frames_ = 0;
};
goog.inherits(dotprod.views.DebugView, dotprod.views.View);

/**
 * @override
 */
dotprod.views.DebugView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  rootNode.appendChild(this.latency_);
  rootNode.appendChild(this.framerate_);
  rootNode.appendChild(this.players_);
  rootNode.appendChild(this.projectiles_);
};

dotprod.views.DebugView.prototype.update = function() {
  ++this.frames_;

  var now = goog.now();
  if (now - this.lastTime_ < 1000) {
    return;
  }

  this.latency_.innerText = this.game_.getProtocol().getRoundTripTime() + 'ms latency';
  this.framerate_.innerText = this.frames_ + ' fps';
  this.players_.innerText = this.game_.getPlayerIndex().getPlayers().length + ' players';
  this.projectiles_.innerText = this.game_.getProjectileIndex().getProjectiles().length + ' projectiles';

  this.frames_ = 0;
  this.lastTime_ = now;
};
