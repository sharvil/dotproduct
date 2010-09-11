/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ShipLayer');

goog.require('dotprod.Camera');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 */
dotprod.layers.ShipLayer = function() {
  /**
   * @type {!Array.<dotprod.sprites.Sprite>}
   * @private
   */
  this.ships_ = [];
};

/**
 * @param {!dotprod.sprites.Sprite} ship
 */
dotprod.layers.ShipLayer.prototype.addShip = function(ship) {
  this.ships_.push(ship);
};

/**
 * @param {!dotprod.sprites.Sprite} ship
 */
dotprod.layers.ShipLayer.prototype.removeShip = function(ship) {
  for (var i = 0; i < this.ships_.length; ++i) {
    if (this.ships_[i] == ship) {
      this.ships_.splice(i, 1);
      return;
    }
  }
};

// TODO(sharvil): super hack!!!!! Fix me!!
/**
 * @param {string} name
 */
dotprod.layers.ShipLayer.prototype.removeShipByName = function(name) {
  for (var i = 0; i < this.ships_.length; ++i) {
    if (this.ships_[i].name_ == name) {
      this.ships_.splice(i, 1);
      return;
    }
  }
};

dotprod.layers.ShipLayer.prototype.updateShip = function(name, packet) {
  for (var i = 0; i < this.ships_.length; ++i) {
    if (this.ships_[i].name_ == name) {
      this.ships_[i].positionUpdate(packet);
      return;
    }
  }
};

/**
 * @param {number} timeDiff
 * @override
 */
dotprod.layers.ShipLayer.prototype.update = function(timeDiff) {
  for (var i = 0; i < this.ships_.length; ++i) {
    this.ships_[i].update(timeDiff);
  }
};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.ShipLayer.prototype.render = function(camera) {
  for (var i = 0; i < this.ships_.length; ++i) {
    this.ships_[i].render(camera);
  }
};
