/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ScoreboardLayer');

goog.require('dotprod.FontFoundry');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.Palette');
goog.require('goog.array');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.Game} game
 */
dotprod.layers.ScoreboardLayer = function(game) {
  var playerIndex = game.getPlayerIndex();

  /**
   * @type {!dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = playerIndex;

  /**
   * @type {number}
   * @private
   */
  this.selectedIndex_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.externalIndex_ = 0;

  /**
   * @type {!dotprod.entities.Player}
   * @private
   */
  this.selectedPlayer_ = playerIndex.getPlayers()[0];
};

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.layers.ScoreboardLayer.LEFT_MARGIN_ = 5;

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.layers.ScoreboardLayer.TOP_MARGIN_ = 5;

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.layers.ScoreboardLayer.FIELD_PADDING_ = 8;

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.layers.ScoreboardLayer.MAX_NAME_CHARACTERS_ = 20;

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.layers.ScoreboardLayer.HEIGHT_ = 3;

/**
 * @override
 */
dotprod.layers.ScoreboardLayer.prototype.update = goog.nullFunction;

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.ScoreboardLayer.prototype.render = function(camera) {
  var context = camera.getContext();
  var dimensions = camera.getDimensions();
  var players = this.playerIndex_.getPlayers();
  var localPlayer = this.playerIndex_.getLocalPlayer();
  var font = dotprod.FontFoundry.scoreboardFont();

  goog.array.sort(players, goog.bind(this.sortPlayersByName_, this));

  players = this.filterToWindow_(players);

  context.save();
    context.font = font;
    context.textBaseline = 'top';

    var fields = this.measureFields(context, players);

    for (var i = 0; i < players.length; ++i) {
      var name = players[i].getName().substr(0, dotprod.layers.ScoreboardLayer.MAX_NAME_CHARACTERS_);
      var points = players[i].points_.toString();

      context.fillStyle = players[i].isFriend(localPlayer) ? dotprod.Palette.friendColor() : dotprod.Palette.foeColor();

      context.textAlign = 'left';
      context.fillText(name, fields.nameX, fields.nameY + font.getLineHeight() * i);
      context.textAlign = 'right';
      context.fillText(points, fields.pointsX, fields.pointsY + font.getLineHeight() * i);
    }

  context.restore();
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!Array.<!dotprod.entities.Player>} players
 * @return {!Object}
 */
dotprod.layers.ScoreboardLayer.prototype.measureFields = function(context, players) {
  var maxName = '';
  var maxPoints = 0;
  for (var i = 0; i < players.length; ++i) {
    maxName = players[i].getName().length > maxName.length ? players[i].getName() : maxName;
    maxPoints = Math.max(players[i].points_, maxPoints);
  }

  maxName = maxName.substr(0, dotprod.layers.ScoreboardLayer.MAX_NAME_CHARACTERS_);
  if (maxName.length < 5) {
    maxName = '12345';
  }

  var ret = {};
  ret.left = dotprod.layers.ScoreboardLayer.LEFT_MARGIN_;
  ret.nameX = ret.left + 1;
  ret.pointsX = ret.nameX + context.measureText(maxName).width + dotprod.layers.ScoreboardLayer.FIELD_PADDING_ + context.measureText(maxPoints.toString()).width;
  ret.right = ret.pointsX + 1;
  ret.top = dotprod.layers.ScoreboardLayer.TOP_MARGIN_;
  ret.nameY = ret.top + 1;
  ret.pointsY = ret.nameY;
  return ret;
};

/**
 * @param {!dotprod.entities.Player} a
 * @param {!dotprod.entities.Player} b
 * @return {number}
 */
dotprod.layers.ScoreboardLayer.prototype.sortPlayersByName_ = function(a, b) {
  return a.getName() < b.getName() ? -1 : b.getName() < a.getName() ? 1 : 0;
};

dotprod.layers.ScoreboardLayer.prototype.selectPrevious = function() {
  this.externalIndex_ = Math.max(this.externalIndex_ - 1, 0);
  this.selectedIndex_ = Math.max(this.selectedIndex_ - 1, 0);
  this.selectedPlayer_ = this.playerIndex_.getPlayers()[this.externalIndex_];
};

dotprod.layers.ScoreboardLayer.prototype.selectNext = function() {
  var players = this.playerIndex_.getPlayers();
  this.externalIndex_ = Math.min(this.externalIndex_ + 1, players.length);
  this.selectedIndex_ = Math.min(this.selectedIndex_ + 1, dotprod.layers.ScoreboardLayer.HEIGHT_);
  this.selectedPlayer_ = players[this.externalIndex_];
};

dotprod.layers.ScoreboardLayer.prototype.filterToWindow_ = function(players) {
  if (this.externalIndex_ >= players.length) {
    this.externalIndex_ = players.length - 1;
  }

  var index = goog.array.indexOf(players, this.selectedPlayer_);
  if (index != -1) {
    this.externalIndex_ = index;
  }
  this.selectedPlayer_ = players[this.externalIndex_];

  if (players.length <= dotprod.layers.ScoreboardLayer.HEIGHT_) {
    this.selectedIndex_ = this.externalIndex_;
    return players;
  }

  var start = Math.max(this.externalIndex_ - this.selectedIndex_, 0);
  var ret = players.splice(start, dotprod.layers.ScoreboardLayer.HEIGHT_);

  if (ret.length < dotprod.layers.ScoreboardLayer.HEIGHT_) {
    ret = players.splice(players.length - dotprod.layers.ScoreboardLayer.HEIGHT_);
    this.selectedIndex_ = goog.array.indexOf(ret, this.selectedPlayer_);
  }

  return ret;
};
