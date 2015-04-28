goog.provide('ui.Loading');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('ResourceManager');

/**
 * @constructor
 * @param {!ResourceManager} resourceManager
 * @param {function()} onLoadCompleteCb
 */
ui.Loading = function(resourceManager, onLoadCompleteCb) {
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
  this.container_ = /** @type {!HTMLDivElement} */ (goog.dom.getElement('loading'));

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.progressBar_ = /** @type {!HTMLDivElement} */ (goog.dom.getElement('ldv-progress'));

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.progressBarValue_ = /** @type {!HTMLDivElement} */ (goog.dom.getElement('ldv-progress-value'));
};

ui.Loading.prototype.load = function(resources) {
  this.setLoadPercent(0);
  this.container_.style.display = 'block';

  var self = this;
  var totalResources = 0;
  var loadedResources = 0;
  var completionCb = function() {
    self.setLoadPercent(++loadedResources / totalResources * 100);
    if (loadedResources == totalResources) {
      self.container_.style.display = 'none';
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
ui.Loading.prototype.setLoadPercent = function(percent) {
  this.progressBarValue_.style.width = percent + '%';
};
