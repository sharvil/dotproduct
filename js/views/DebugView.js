/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.DebugView');

goog.require('dotprod.Camera');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Camera} camera
 */
dotprod.views.DebugView = function(game, camera) {
  dotprod.views.View.call(this);

  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!dotprod.Camera}
   * @private
   */
  this.camera_ = camera;

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.view_.classList.add(dotprod.views.DebugView.VIEW_CLASS_NAME_);

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
 * @type {string}
 * @private
 * @const
 */
dotprod.views.DebugView.VIEW_CLASS_NAME_ = 'dv';

/**
 * @override
 */
dotprod.views.DebugView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  rootNode.appendChild(this.view_);
};

dotprod.views.DebugView.prototype.update = function() {
  ++this.frames_;

  var now = goog.now();
  if (now - this.lastTime_ < 1000) {
    return;
  }

  this.view_.innerText = this.game_.getProtocol().getRoundTripTime() + 'ms, ' +
                         this.frames_ + 'fps, ' +
                         this.game_.getPlayerIndex().getPlayers().length + ' // ' +
                         this.game_.getProjectileIndex().getProjectiles().length;

  this.frames_ = 0;
  this.lastTime_ = now;
};
