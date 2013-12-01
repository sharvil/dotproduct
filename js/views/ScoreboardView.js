/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('views.ScoreboardView');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('views.View');

/**
 * @constructor
 * @extends {views.View}
 * @param {!Game} game
 */
views.ScoreboardView = function(game) {
  goog.base(this);

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.view_.classList.add(views.ScoreboardView.SCOREBOARD_VIEW_CLASS_NAME_);

  /**
   * @type {!PlayerIndex}
   * @private
   */
  this.playerIndex_ = game.getPlayerIndex();
};
goog.inherits(views.ScoreboardView, views.View);

/**
 * @type {string}
 * @private
 * @const
 */
views.ScoreboardView.SCOREBOARD_VIEW_CLASS_NAME_ = 'sv';

/**
 * @type {string}
 * @private
 * @const
 */
views.ScoreboardView.HIDE_CLASS_NAME_ = 'sv-hidden';

/**
 * @type {string}
 * @private
 * @const
 */
views.ScoreboardView.NAME_CLASS_NAME_ = 'sv-name';

/**
 * @type {string}
 * @private
 * @const
 */
views.ScoreboardView.SCORE_CLASS_NAME_ = 'sv-score';

/**
 * @type {string}
 * @private
 * @const
 */
views.ScoreboardView.FRIEND_CLASS_NAME_ = 'sv-row-friend';

/**
 * @type {string}
 * @private
 * @const
 */
views.ScoreboardView.FOE_CLASS_NAME_ = 'sv-row-foe';

/**
 * @override
 */
views.ScoreboardView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  rootNode.appendChild(this.view_);

  var self = this;
  setTimeout(function() {
    self.hide();
  }, 2000);
};

/**
 * @override
 */
views.ScoreboardView.prototype.show = function() {
  this.view_.classList.remove(views.ScoreboardView.HIDE_CLASS_NAME_);
};

/**
 * @override
 */
views.ScoreboardView.prototype.hide = function() {
  this.view_.classList.add(views.ScoreboardView.HIDE_CLASS_NAME_);
};

views.ScoreboardView.prototype.update = function() {
  this.view_.innerHTML = '';

  var self = this;
  var localPlayer = this.playerIndex_.getLocalPlayer();
  var compareFn = function(p1, p2) {
    return p2.getPoints() - p1.getPoints();
  };

  this.playerIndex_.forEach(function(player) {
    var nameNode = goog.dom.createElement('span');
    nameNode.classList.add(views.ScoreboardView.NAME_CLASS_NAME_);
    nameNode.textContent = player.getName();

    var scoreNode = goog.dom.createElement('span');
    scoreNode.classList.add(views.ScoreboardView.SCORE_CLASS_NAME_);
    scoreNode.textContent = player.points_;

    var container = goog.dom.createElement('div');
    container.classList.add(player.isFriend(localPlayer) ? views.ScoreboardView.FRIEND_CLASS_NAME_ : views.ScoreboardView.FOE_CLASS_NAME_);
    container.appendChild(nameNode);
    container.appendChild(scoreNode);

    self.view_.appendChild(container);
  }, compareFn);
};
