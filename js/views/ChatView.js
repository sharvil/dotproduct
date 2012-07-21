/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.ChatView');

goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('dotprod.Protocol');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Game} game
 */
dotprod.views.ChatView = function(game) {
  dotprod.views.View.call(this);

  /**
   * @type {dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = game.getPlayerIndex();

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = game.getSettings();

  /**
   * @type {!dotprod.Protocol}
   * @private
   */
  this.protocol_ = game.getProtocol();

  /**
   * @type {!Object.<string, !Array.<function(string)>>}
   * @private
   */
  this.handlers_ = {};

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.view_.classList.add(dotprod.views.ChatView.CHAT_VIEW_CLASS_NAME_);

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.text_ = /** @type {!HTMLDivElement} */ (goog.dom.createElement('div'));
  this.text_.classList.add(dotprod.views.ChatView.TEXT_CLASS_NAME_);

  /**
   * @type {!HTMLInputElement}
   * @private
   */
  this.chatBox_ = /** @type {!HTMLInputElement} */ (goog.dom.createElement('input'));
  this.chatBox_.type = 'text';
  this.chatBox_.classList.add(dotprod.views.ChatView.CHAT_BOX_CLASS_NAME_);
  this.chatBox_.classList.add(dotprod.views.ChatView.CHAT_BOX_HIDDEN_CLASS_NAME_);

  goog.events.listen(window, goog.events.EventType.KEYPRESS, goog.bind(this.onKeyPress_, this), true);
  goog.events.listen(window, goog.events.EventType.KEYDOWN, goog.bind(this.keyFilter_, this), true);
  goog.events.listen(window, goog.events.EventType.KEYUP, goog.bind(this.keyFilter_, this), true);
};
goog.inherits(dotprod.views.ChatView, dotprod.views.View);

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ChatView.CHAT_VIEW_CLASS_NAME_ = 'cv';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ChatView.TEXT_CLASS_NAME_ = 'cv-text';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ChatView.TEXT_NAME_CLASS_NAME_ = 'cv-text-name';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ChatView.TEX_MESSAGE_CLASS_NAME_ = 'cv-text-message';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ChatView.CHAT_BOX_CLASS_NAME_ = 'cv-input';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ChatView.CHAT_BOX_HIDDEN_CLASS_NAME_ = 'cv-hidden';

/**
 * @type {string}
 * @private
 * @const
 */
dotprod.views.ChatView.CHAT_BOX_VISIBLE_CLASS_NAME_ = 'cv-visible';

dotprod.views.ChatView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  this.view_.appendChild(this.text_);
  this.view_.appendChild(this.chatBox_);
  rootNode.appendChild(this.view_);
};

/**
 * @param {!dotprod.entities.Player} player
 * @param {string} message
 */
dotprod.views.ChatView.prototype.addMessage = function(player, message) {
  var isAtBottom = this.view_.scrollTop + this.view_.offsetHeight >= this.view_.scrollHeight;

  var messageNode = goog.dom.createElement('div');

  var nameNode = goog.dom.createElement('span');
  nameNode.classList.add(dotprod.views.ChatView.TEXT_NAME_CLASS_NAME_);
  nameNode.innerText = player.getName() + ': ';

  var textNode = goog.dom.createElement('span');
  textNode.classList.add(dotprod.views.ChatView.TEX_MESSAGE_CLASS_NAME_);
  textNode.innerText = message;
  textNode.innerHTML = window.linkify(textNode.innerHTML);

  messageNode.appendChild(nameNode);
  messageNode.appendChild(textNode);

  this.text_.appendChild(messageNode);

  if (isAtBottom) {
    this.view_.scrollTop = this.view_.scrollHeight;
  }
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
dotprod.views.ChatView.prototype.onKeyPress_ = function(event) {
  if (event.keyCode != goog.events.KeyCodes.ENTER) {
    // Don't accumulate characters in the input buffer if the chat box isn't currently visible.
    if (!this.chatBox_.classList.contains(dotprod.views.ChatView.CHAT_BOX_VISIBLE_CLASS_NAME_)) {
      event.preventDefault();
    }
    return;
  }

  this.chatBox_.classList.toggle(dotprod.views.ChatView.CHAT_BOX_VISIBLE_CLASS_NAME_);
  this.chatBox_.classList.toggle(dotprod.views.ChatView.CHAT_BOX_HIDDEN_CLASS_NAME_);

  // The chat box was just shown -- clear any internal state and set focus on it.
  if (this.chatBox_.classList.contains(dotprod.views.ChatView.CHAT_BOX_VISIBLE_CLASS_NAME_)) {
    this.chatBox_.focus();
    return;
  }

  var message = this.chatBox_.value.trim();
  if (message != '') {
    var command = message.split(' ')[0];
    if (this.handlers_[command]) {
      for (var i in this.handlers_[command]) {
        this.handlers_[command][i](message);
      }
    } else {
      this.protocol_.sendChat(message);
      this.addMessage(this.playerIndex_.getLocalPlayer(), message);
    }
  }
  this.chatBox_.value = '';
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
dotprod.views.ChatView.prototype.keyFilter_ = function(event) {
  if (this.chatBox_.classList.contains(dotprod.views.ChatView.CHAT_BOX_VISIBLE_CLASS_NAME_)) {
    event.stopPropagation();
  }
};
