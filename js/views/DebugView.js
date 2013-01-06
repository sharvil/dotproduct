/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.DebugView');

goog.require('dotprod.Viewport');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Viewport} viewport
 */
dotprod.views.DebugView = function(game, viewport) {
  goog.base(this);

  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!dotprod.Viewport}
   * @private
   */
  this.viewport_ = viewport;

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.view_.classList.add(dotprod.views.DebugView.VIEW_CLASS_NAME_);

  /**
   * @type {number}
   * @private
   */
  this.lastTime_ = goog.now();

  /**
   * @type {number}
   * @private
   */
  this.frames_ = 0;
};
goog.inherits(dotprod.views.DebugView, dotprod.views.View);

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.DebugView.VIEW_CLASS_NAME_ = 'dv';

/**
 * @override
 */
dotprod.views.DebugView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  rootNode.appendChild(this.view_);
};

dotprod.views.DebugView.prototype.getEventTimeString_ = function() {
  var daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var today = new Date();
  var daysUntilThursday = (4 - today.getDay() + 7) % 7;
  var nextEventDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilThursday, 22));

  var delta = nextEventDate.getTime() - today.getTime();
  if (delta < 0) {
    if (delta > -1000 * 3600 * 2) {
      return '';
    }
    nextEventDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 7, 22));
    delta = nextEventDate.getTime() - today.getTime();
  }

  var days = Math.floor(delta / 24 / 3600 / 1000);
  var hours = Math.floor(delta / 3600 / 1000) % 24;
  var minutes = Math.floor(delta / 60 / 1000) % 60;
  var seconds = Math.floor(delta / 1000) % 60;

  var str = 'Next game';
  if (days > 0) {
    var pad = nextEventDate.getMinutes() < 10 ? '0' : '';
    var ampm = nextEventDate.getHours() >= 12 ? 'pm' : 'am';
    str += ' on ' + daysOfWeek[nextEventDate.getDay()] + ', ' + monthName[nextEventDate.getMonth()] + ' ' + nextEventDate.getDate() + ' at ' + (nextEventDate.getHours() % 12) + ':' + pad + nextEventDate.getMinutes() + ampm;
  } else {
    var sPad = seconds < 10 ? '0' : '';
    var mPad = minutes < 10 ? '0' : '';
    var hPad = hours < 10 ? '0' : '';
    str += ' starting in ' + hPad + hours + ':' + mPad + minutes + ':' + sPad + seconds;
  }
  return str;
};

dotprod.views.DebugView.prototype.update = function() {
  ++this.frames_;

  var now = goog.now();
  if (now - this.lastTime_ < 1000) {
    return;
  }

  var html = this.getEventTimeString_();
  if (html) {
    html += '<br><br>';
  }

  html += this.game_.getProtocol().getRoundTripTime() + 'ms, ' +
          this.frames_ + 'fps, ' +
          this.game_.getPlayerIndex().getCount() + ' // ' +
          this.game_.getProjectileIndex().getCount();

  this.view_.innerHTML = html;

  this.frames_ = 0;
  this.lastTime_ = now;
};
