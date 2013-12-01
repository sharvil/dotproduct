/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('views.LoadingView');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('ResourceManager');
goog.require('views.View');

/**
 * @constructor
 * @extends {views.View}
 * @param {!ResourceManager} resourceManager
 * @param {function()} onLoadCompleteCb
 */
views.LoadingView = function(resourceManager, onLoadCompleteCb) {
  /**
   * @type {!ResourceManager}
   * @private
   */
  this.resourceManager_ = resourceManager;

  /**
   * @type {function()}
   * @private
   */
  this.onLoadCompleteCb_ = onLoadCompleteCb;

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.progressBar_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.progressBar_.className = views.LoadingView.CSS_PROGRESS_BAR_;

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.progressBarValue_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.progressBarValue_.innerHTML = '&nbsp;';
  this.progressBarValue_.className = views.LoadingView.CSS_PROGRESS_BAR_VALUE_;
};
goog.inherits(views.LoadingView, views.View);

/**
 * @type {string}
 * @const
 * @private
 */
views.LoadingView.CSS_PROGRESS_BAR_ = 'ldv-progress';

/**
 * @type {string}
 * @const
 * @private
 */
views.LoadingView.CSS_PROGRESS_BAR_VALUE_ = 'ldv-progress-value';

/**
 * @param {!HTMLDivElement} rootNode
 * @override
 */
views.LoadingView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  this.progressBar_.appendChild(this.progressBarValue_);
  rootNode.appendChild(this.progressBar_);
};

views.LoadingView.prototype.load = function(resources) {
  this.setLoadPercent(0);

  var self = this;
  var totalResources = 0;
  var loadedResources = 0;
  var completionCb = function() {
    self.setLoadPercent(++loadedResources / totalResources * 100);
    if (loadedResources == totalResources) {
      self.onLoadCompleteCb_();
    }
  };

  for (var name in resources['images']) {
    var resource = resources['images'][name];
    this.resourceManager_.loadImage(name, resource['url'], resource['xTiles'], resource['yTiles'], completionCb);
    ++totalResources;
  }

  for (var name in resources['spritesheets']) {
    var resource = resources['spritesheets'][name];
    this.resourceManager_.loadSpriteSheet(name, resource['url'], resource['xTiles'], resource['yTiles'], resource['frames'], resource['period'], completionCb);
    ++totalResources;
  }

  for (var name in resources['sounds']) {
    var resource = resources['sounds'][name];
    this.resourceManager_.loadSound(name, resource['url'], completionCb);
    ++totalResources;
  }
};

/**
 * @param {number} percent
 */
views.LoadingView.prototype.setLoadPercent = function(percent) {
  this.progressBarValue_.style.width = percent + '%';
};
