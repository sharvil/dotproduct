/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Player');

goog.require('dotprod.entities.Entity');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 */
dotprod.entities.Player = function(name) {
  dotprod.entities.Entity.call(this);

  /**
   * @type {string}
   * @protected
   */
  this.name_ = name;
};
goog.inherits(dotprod.entities.Player, dotprod.entities.Entity);

/**
 * @return {string}
 */
dotprod.entities.Player.prototype.getName = function() {
  return this.name_;
};
