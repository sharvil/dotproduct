/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.ScoreboardView');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Game} game
 */
dotprod.views.ScoreboardView = function(game) {
  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.view_.classList.add(dotprod.views.ScoreboardView.SCOREBOARD_VIEW_CLASS_NAME_);

  /**
   * @type {!dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = game.getPlayerIndex();

  dotprod.views.View.call(this);
};
goog.inherits(dotprod.views.ScoreboardView, dotprod.views.View);

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ScoreboardView.SCOREBOARD_VIEW_CLASS_NAME_ = 'sv';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ScoreboardView.HIDE_CLASS_NAME_ = 'sv-hidden';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ScoreboardView.NAME_CLASS_NAME_ = 'sv-name';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ScoreboardView.SCORE_CLASS_NAME_ = 'sv-score';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ScoreboardView.FRIEND_CLASS_NAME_ = 'sv-row-friend';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ScoreboardView.FOE_CLASS_NAME_ = 'sv-row-foe';

/**
 * @override
 */
dotprod.views.ScoreboardView.prototype.renderDom = function(rootNode) {
  dotprod.views.View.call(this, 'renderDom', rootNode);

  rootNode.appendChild(this.view_);

  var self = this;
  setTimeout(function() {
    self.hide();
  }, 2000);
};

/**
 * @override
 */
dotprod.views.ScoreboardView.prototype.show = function() {
  this.view_.classList.remove(dotprod.views.ScoreboardView.HIDE_CLASS_NAME_);
};

/**
 * @override
 */
dotprod.views.ScoreboardView.prototype.hide = function() {
  this.view_.classList.add(dotprod.views.ScoreboardView.HIDE_CLASS_NAME_);
};

dotprod.views.ScoreboardView.prototype.update = function() {
  this.view_.innerHTML = '';

  var self = this;
  var localPlayer = this.playerIndex_.getLocalPlayer();
  var compareFn = function(p1, p2) {
    return p2.getPoints() - p1.getPoints();
  };

  this.playerIndex_.forEach(function(player) {
    var nameNode = goog.dom.createElement('span');
    nameNode.classList.add(dotprod.views.ScoreboardView.NAME_CLASS_NAME_);
    nameNode.textContent = player.getName();

    var scoreNode = goog.dom.createElement('span');
    scoreNode.classList.add(dotprod.views.ScoreboardView.SCORE_CLASS_NAME_);
    scoreNode.textContent = player.points_;

    var container = goog.dom.createElement('div');
    container.classList.add(player.isFriend(localPlayer) ? dotprod.views.ScoreboardView.FRIEND_CLASS_NAME_ : dotprod.views.ScoreboardView.FOE_CLASS_NAME_);
    container.appendChild(nameNode);
    container.appendChild(scoreNode);

    self.view_.appendChild(container);
  }, compareFn);
};
