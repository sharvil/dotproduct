goog.provide('ui.Scoreboard');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');

/**
 * @constructor
 * @param {!Game} game
 */
ui.Scoreboard = function(game) {
  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.getElement('sv'));

  /**
   * @type {!PlayerIndex}
   * @private
   */
  this.playerIndex_ = game.getPlayerIndex();

  var self = this;
  setTimeout(function() {
    self.hide();
  }, 2000);
};

/**
 * @type {string}
 * @private
 * @const
 */
ui.Scoreboard.HIDE_CLASS_NAME_ = 'sv-hidden';

/**
 * @type {string}
 * @private
 * @const
 */
ui.Scoreboard.NAME_CLASS_NAME_ = 'sv-name';

/**
 * @type {string}
 * @private
 * @const
 */
ui.Scoreboard.SCORE_CLASS_NAME_ = 'sv-score';

/**
 * @type {string}
 * @private
 * @const
 */
ui.Scoreboard.FRIEND_CLASS_NAME_ = 'sv-row-friend';

/**
 * @type {string}
 * @private
 * @const
 */
ui.Scoreboard.FOE_CLASS_NAME_ = 'sv-row-foe';

ui.Scoreboard.prototype.show = function() {
  this.view_.classList.remove(ui.Scoreboard.HIDE_CLASS_NAME_);
};

ui.Scoreboard.prototype.hide = function() {
  this.view_.classList.add(ui.Scoreboard.HIDE_CLASS_NAME_);
};

ui.Scoreboard.prototype.update = function() {
  this.view_.innerHTML = '';

  var self = this;
  var localPlayer = this.playerIndex_.getLocalPlayer();
  var compareFn = function(p1, p2) {
    return p2.getPoints() - p1.getPoints();
  };

  this.playerIndex_.forEach(function(player) {
    var nameNode = goog.dom.createElement('span');
    nameNode.classList.add(ui.Scoreboard.NAME_CLASS_NAME_);
    nameNode.textContent = player.getName();

    var scoreNode = goog.dom.createElement('span');
    scoreNode.classList.add(ui.Scoreboard.SCORE_CLASS_NAME_);
    scoreNode.textContent = player.getPoints();

    var container = goog.dom.createElement('div');
    container.classList.add(player.isFriend(localPlayer) ? ui.Scoreboard.FRIEND_CLASS_NAME_ : ui.Scoreboard.FOE_CLASS_NAME_);
    container.appendChild(nameNode);
    container.appendChild(scoreNode);

    self.view_.appendChild(container);
  }, compareFn);
};
