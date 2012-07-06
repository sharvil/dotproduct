/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.RadarLayer');

goog.require('dotprod.entities.LocalPlayer');
goog.require('dotprod.entities.Player');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.Palette');
goog.require('dotprod.Rect');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.Game} game
 */
dotprod.layers.RadarLayer = function(game) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {number}
   * @private
   */
  this.tileWidth_ = this.game_.getResourceManager().getImage('tileset').getTileWidth();

  /**
   * @type {number}
   * @private
   */
  this.tileHeight_ = this.game_.getResourceManager().getImage('tileset').getTileHeight();

  /**
   * @type {number}
   * @private
   */
  this.blinkDirection_ = -1;

  /**
   * @type {number}
   * @private
   */
  this.blinkAlpha_ = 1;
};

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.layers.RadarLayer.SCALE_FACTOR_ = 0.3;

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.layers.RadarLayer.ZOOM_FACTOR_ = 2.5;

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.layers.RadarLayer.BLINK_DELTA_ = 0.03;

/**
 * @override
 */
dotprod.layers.RadarLayer.prototype.update = function() {
  this.blinkAlpha_ += this.blinkDirection_ * dotprod.layers.RadarLayer.BLINK_DELTA_;
  if (this.blinkAlpha_ >= 1) {
    this.blinkDirection_ = -1;
    this.blinkAlpha_ = 1;
  } else if (this.blinkAlpha_ <= 0) {
    this.blinkDirection_ = 1;
    this.blinkAlpha_ = 0;
  }
};

/**
 * @override
 */
dotprod.layers.RadarLayer.prototype.render = function(camera) {
  var context = camera.getContext();
  var dimensions = camera.getDimensions();

//  var radarWidth = Math.floor(dimensions.width * dotprod.layers.RadarLayer.SCALE_FACTOR_);
  var radarHeight = Math.floor(dimensions.height * dotprod.layers.RadarLayer.SCALE_FACTOR_);
  var radarWidth = radarHeight;

  context.save();
    var left = dimensions.width - radarWidth;
    var top = dimensions.height - radarHeight;
    context.translate(left, top);

    // Render border. The Canvas API is retarded with strokes -- apparently it draws
    // half a pixel *around* the stroke path so we have to offset coordinates by 0.5px.
    context.strokeStyle = dotprod.Palette.borderColor();
    context.strokeRect(-0.5, -0.5, radarWidth, radarHeight);

    // Set clipping region
    context.beginPath();
      context.rect(0, 0, radarWidth, radarHeight);
    context.clip();

    // Draw radar background
    context.fillStyle = dotprod.Palette.radarBgColor();
    context.fillRect(0, 0, radarWidth, radarHeight);

    this.renderMap_(context, dimensions, radarWidth, radarHeight);
    this.renderPlayers_(context, dimensions, radarWidth, radarHeight);
  context.restore();
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 * @param {number} radarWidth
 * @param {number} radarHeight
 */
dotprod.layers.RadarLayer.prototype.renderMap_ = function(context, dimensions, radarWidth, radarHeight) {
  var map = this.game_.getMap();
  var SCALE_FACTOR = dotprod.layers.RadarLayer.SCALE_FACTOR_;
  var ZOOM_FACTOR = dotprod.layers.RadarLayer.ZOOM_FACTOR_;

  var tileWidth = this.tileWidth_;
  var tileHeight = this.tileHeight_;
  var scaledTileWidth = Math.floor(tileWidth * SCALE_FACTOR / ZOOM_FACTOR) || 1;
  var scaledTileHeight = Math.floor(tileHeight * SCALE_FACTOR / ZOOM_FACTOR) || 1;

  context.fillStyle = dotprod.Palette.radarTileColor();
  var leftTile = Math.floor(dimensions.x / tileWidth - (radarWidth / 2 / scaledTileWidth));
  var topTile = Math.floor(dimensions.y / tileHeight - (radarHeight / 2 / scaledTileHeight));
  var rightTile = Math.ceil(dimensions.x / tileWidth + (radarWidth / 2 / scaledTileWidth));
  var bottomTile = Math.ceil(dimensions.y / tileHeight + (radarHeight / 2 / scaledTileHeight));

  leftTile = Math.max(leftTile, 0);
  topTile = Math.max(topTile, 0);
  rightTile = Math.min(rightTile, map.getWidth());
  bottomTile = Math.min(bottomTile, map.getHeight());

  var tiles = map.getTiles(dotprod.Rect.fromBox(leftTile, topTile, rightTile, bottomTile));
  for (var i = 0; i < tiles.length; ++i) {
    var tile = tiles[i];
    var xPixels = (tile.x - dimensions.x / tileWidth) * scaledTileWidth;
    var yPixels = (tile.y - dimensions.y / tileHeight) * scaledTileHeight;
    var x = Math.floor(xPixels + radarWidth / 2);
    var y = Math.floor(yPixels + radarHeight / 2);

    context.fillRect(x, y, scaledTileWidth, scaledTileHeight);
  }
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 * @param {number} radarWidth
 * @param {number} radarHeight
 */
dotprod.layers.RadarLayer.prototype.renderPlayers_ = function(context, dimensions, radarWidth, radarHeight) {
  var players = this.game_.getPlayerIndex().getPlayers();
  var localPlayer = this.game_.getPlayerIndex().getLocalPlayer();

  var SCALE_FACTOR = dotprod.layers.RadarLayer.SCALE_FACTOR_;
  var ZOOM_FACTOR = dotprod.layers.RadarLayer.ZOOM_FACTOR_;
  var actualXScale = (Math.floor(this.tileWidth_ * SCALE_FACTOR / ZOOM_FACTOR) || 1) / this.tileWidth_;
  var actualYScale = (Math.floor(this.tileHeight_ * SCALE_FACTOR / ZOOM_FACTOR) || 1) / this.tileHeight_;

  for (var i = 0; i < players.length; ++i) {
    var player = players[i];
    if (!player.isAlive()) {
      continue;
    }

    var position = player.getPosition();
    var xPixels = Math.floor(position.getX() * actualXScale) - (dimensions.x * actualXScale);
    var yPixels = Math.floor(position.getY() * actualYScale) - (dimensions.y * actualYScale);
    var x = Math.floor(xPixels + radarWidth / 2);
    var y = Math.floor(yPixels + radarHeight / 2);

    context.fillStyle = player.isFriend(localPlayer) ? dotprod.Palette.friendColor(this.blinkAlpha_) : dotprod.Palette.foeColor();
    context.fillRect(x - 1, y - 1, 3, 3);
  }
};
