/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.GameConfig');

goog.require('dotprod.Map');

/**
 * @constructor
 * @param {!Object.<string, !Object>} resources
 * @param {!Object} settings
 * @param {!Object.<number, number>} mapData
 */
dotprod.GameConfig = function(resources, settings, mapData) {
  /**
   * @type {!Object.<string, !Object>}
   * @private
   */
  this.resources_ = resources;

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = settings;

  /**
   * @type {!dotprod.Map}
   * @private
   */
  this.map_ = new dotprod.Map(mapData, settings['map']['width'], settings['map']['height']);
};

/**
 * @return {!Object.<string, !Object>}
 */
dotprod.GameConfig.prototype.getResources = function() {
  return this.resources_;
};

/**
 * @return {!Object}
 */
dotprod.GameConfig.prototype.getSettings = function() {
  return this.settings_;
};

/**
 * @return {!dotprod.Map}
 */
dotprod.GameConfig.prototype.getMap = function() {
  return this.map_;
};
