goog.provide('layers.RadarLayer');

goog.require('goog.dom');

goog.require('graphics.Drawable');
goog.require('graphics.Layer');
goog.require('math.Rect');
goog.require('model.ModelObject');
goog.require('model.player.LocalPlayer');
goog.require('model.player.Player');
goog.require('Palette');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 */
layers.RadarLayer = function(game) {
  goog.base(this, game.getSimulation());

  /**
   * @type {!Game}
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
   * @type {HTMLCanvasElement}
   * @private
   */
  this.mapCanvas_ = null;

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

  game.getPainter().registerDrawable(graphics.Layer.HUD, this);
};
goog.inherits(layers.RadarLayer, model.ModelObject);

/**
 * @const
 * @type {number}
 * @private
 */
layers.RadarLayer.SCALE_FACTOR_ = 0.12;

/**
 * @const
 * @type {number}
 * @private
 */
layers.RadarLayer.RADAR_SIZE_PERCENT_ = 0.3;

/**
 * @const
 * @type {number}
 * @private
 */
layers.RadarLayer.BLINK_DELTA_ = 0.03;

/**
 * @override
 */
layers.RadarLayer.prototype.advanceTime = function() {
  this.blinkAlpha_ += this.blinkDirection_ * layers.RadarLayer.BLINK_DELTA_;
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
layers.RadarLayer.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();

  var radarHeight = Math.floor(dimensions.height * layers.RadarLayer.RADAR_SIZE_PERCENT_);
  var radarWidth = radarHeight;

  context.save();
    var left = dimensions.width - radarWidth;
    var top = dimensions.height - radarHeight;
    context.translate(left, top);

    // Render border. The Canvas API is retarded with strokes -- apparently it draws
    // half a pixel *around* the stroke path so we have to offset coordinates by 0.5px.
    context.strokeStyle = Palette.borderColor();
    context.strokeRect(-0.5, -0.5, radarWidth, radarHeight);

    // Set clipping region
    context.beginPath();
      context.rect(0, 0, radarWidth, radarHeight);
    context.clip();

    // Draw radar background
    context.fillStyle = Palette.radarBgColor();
    context.fillRect(0, 0, radarWidth, radarHeight);

    this.renderMap_(context, dimensions, radarWidth, radarHeight);
    this.renderPrizes_(context, dimensions, radarWidth, radarHeight);
    this.renderPlayers_(context, dimensions, radarWidth, radarHeight);
  context.restore();
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 * @param {number} radarWidth
 * @param {number} radarHeight
 */
layers.RadarLayer.prototype.renderMap_ = function(context, dimensions, radarWidth, radarHeight) {
  if (!this.mapCanvas_) {
    this.prerenderMapOnCanvas_();
  }

  var SCALE_FACTOR = layers.RadarLayer.SCALE_FACTOR_;

  var tileWidth = this.tileWidth_;
  var tileHeight = this.tileHeight_;
  var scaledTileWidth = Math.floor(tileWidth * SCALE_FACTOR) || 1;
  var scaledTileHeight = Math.floor(tileHeight * SCALE_FACTOR) || 1;

  var sourceX = Math.floor((dimensions.x * scaledTileWidth / tileWidth) - (radarWidth / 2));
  var sourceY = Math.floor((dimensions.y * scaledTileHeight / tileHeight) - (radarHeight / 2));
  var destX = 0;
  var destY = 0;

  // Make sure all source dimensions fall within the source image. If they don't, the drawImage
  // will fail.
  if (sourceX < 0) {
    destX = -sourceX;
    sourceX = 0;
  } else if (sourceX + radarWidth > this.mapCanvas_.width) {
    radarWidth = this.mapCanvas_.width - sourceX;
  }

  if (sourceY < 0) {
    destY = -sourceY;
    sourceY = 0;
  } else if (sourceY + radarHeight > this.mapCanvas_.height) {
    radarHeight = this.mapCanvas_.height - sourceY;
  }

  context.drawImage(this.mapCanvas_, sourceX, sourceY, radarWidth, radarHeight, destX, destY, radarWidth, radarHeight);
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 * @param {number} radarWidth
 * @param {number} radarHeight
 */
layers.RadarLayer.prototype.renderPrizes_ = function(context, dimensions, radarWidth, radarHeight) {
  var SCALE_FACTOR = layers.RadarLayer.SCALE_FACTOR_;

  var tileWidth = this.tileWidth_;
  var tileHeight = this.tileHeight_;
  var scaledTileWidth = Math.floor(tileWidth * SCALE_FACTOR) || 1;
  var scaledTileHeight = Math.floor(tileHeight * SCALE_FACTOR) || 1;

  context.fillStyle = Palette.radarPrizeColor();
  this.game_.getPrizeIndex().forEach(function(prize) {
    var xPixels = (prize.getX() - dimensions.x / tileWidth) * scaledTileWidth;
    var yPixels = (prize.getY() - dimensions.y / tileHeight) * scaledTileHeight;
    var x = Math.floor(xPixels + radarWidth / 2);
    var y = Math.floor(yPixels + radarHeight / 2);

    context.fillRect(x, y, scaledTileWidth, scaledTileHeight);
  });
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Object} dimensions
 * @param {number} radarWidth
 * @param {number} radarHeight
 */
layers.RadarLayer.prototype.renderPlayers_ = function(context, dimensions, radarWidth, radarHeight) {
  var self = this;
  var localPlayer = this.game_.getPlayerIndex().getLocalPlayer();

  var SCALE_FACTOR = layers.RadarLayer.SCALE_FACTOR_;
  var actualXScale = (Math.floor(this.tileWidth_ * SCALE_FACTOR) || 1) / this.tileWidth_;
  var actualYScale = (Math.floor(this.tileHeight_ * SCALE_FACTOR) || 1) / this.tileHeight_;

  this.game_.getPlayerIndex().forEach(function(player) {
    if (!player.isAlive()) {
      return;
    }

    var position = player.getPosition();
    var xPixels = Math.floor(position.getX() * actualXScale) - (dimensions.x * actualXScale);
    var yPixels = Math.floor(position.getY() * actualYScale) - (dimensions.y * actualYScale);
    var x = Math.floor(xPixels + radarWidth / 2);
    var y = Math.floor(yPixels + radarHeight / 2);
    var alpha = (player == localPlayer) ? self.blinkAlpha_ : 1;

    context.fillStyle = player.isFriend(localPlayer) ? Palette.friendColor(alpha) : Palette.foeColor();
    context.fillRect(x - 1, y - 1, 3, 3);
  });
};

layers.RadarLayer.prototype.prerenderMapOnCanvas_ = function() {
  var SCALE_FACTOR = layers.RadarLayer.SCALE_FACTOR_;
  var map = this.game_.getMap();
  var tileWidth = this.tileWidth_;
  var tileHeight = this.tileHeight_;
  var scaledTileWidth = Math.floor(tileWidth * SCALE_FACTOR) || 1;
  var scaledTileHeight = Math.floor(tileHeight * SCALE_FACTOR) || 1;

  this.mapCanvas_ = /** @type {!HTMLCanvasElement} */ (goog.dom.createElement('canvas'));
  this.mapCanvas_.width = Math.ceil(map.getWidth() * scaledTileWidth);
  this.mapCanvas_.height = Math.ceil(map.getHeight() * scaledTileHeight);

  var context = this.mapCanvas_.getContext('2d');
  var tiles = map.getTiles(math.Rect.fromBox(0, 0, map.getWidth() - 1, map.getHeight() - 1));

  context.fillStyle = Palette.radarTileColor();
  for (var i = 0; i < tiles.length; ++i) {
    var tile = tiles[i];
    var x = tile.x * scaledTileWidth;
    var y = tile.y * scaledTileHeight;

    context.fillRect(x, y, scaledTileWidth, scaledTileHeight);
  }
};

/**
 * @override
 */
layers.RadarLayer.prototype.onInvalidate_ = function() {
  goog.asserts.assert(false, 'Radar layer should never be invalidated.');
};
