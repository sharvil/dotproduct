/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.LoadingView');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('dotprod.ResourceManager');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.ResourceManager} resourceManager
 * @param {function()} onLoadCompleteCb
 */
dotprod.views.LoadingView = function(resourceManager, onLoadCompleteCb) {
  /**
   * @type {!dotprod.ResourceManager}
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
  this.progressBar_.className = dotprod.views.LoadingView.CSS_PROGRESS_BAR_;

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.progressBarValue_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.progressBarValue_.innerHTML = '&nbsp;';
  this.progressBarValue_.className = dotprod.views.LoadingView.CSS_PROGRESS_BAR_VALUE_;
};
goog.inherits(dotprod.views.LoadingView, dotprod.views.View);

/**
 * @type {string}
 * @const
 * @private
 */
dotprod.views.LoadingView.CSS_PROGRESS_BAR_ = 'ldv-progress';

/**
 * @type {string}
 * @const
 * @private
 */
dotprod.views.LoadingView.CSS_PROGRESS_BAR_VALUE_ = 'ldv-progress-value';

/**
 * @param {!HTMLDivElement} rootNode
 * @override
 */
dotprod.views.LoadingView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  this.progressBar_.appendChild(this.progressBarValue_);
  rootNode.appendChild(this.progressBar_);
};

dotprod.views.LoadingView.prototype.load = function(resources) {
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

  for (var name in resources['graphics']) {
    var resource = resources['graphics'][name];
    this.resourceManager_.loadImage(name, resource['url'], resource['xTiles'], resource['yTiles'], completionCb);
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
dotprod.views.LoadingView.prototype.setLoadPercent = function(percent) {
  this.progressBarValue_.style.width = percent + '%';
};
