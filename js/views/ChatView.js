/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.ChatView');

goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('dotprod.ChatMessages');
goog.require('dotprod.Protocol');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Game} game
 * @param {!dotprod.ChatMessages} messages
 */
dotprod.views.ChatView = function(game, messages) {
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
   * @type {!dotprod.ChatMessages}
   * @private
   */
  this.messages_ = messages;

  /**
   * @type {!Object.<string, !Array.<function(string)>>}
   * @private
   */
  this.handlers_ = {};

  /**
   * @type {!HTMLInputElement}
   * @private
   */
  this.chatBox_ = /** @type {!HTMLInputElement} */ (goog.dom.createElement('input'));
  this.chatBox_.className = dotprod.views.ChatView.CHAT_BOX_CLASS_NAME_;
  goog.events.listen(this.chatBox_, 'blur', goog.bind(this.onChatLostFocus_, this));
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
dotprod.views.ChatView.CHAT_BOX_CLASS_NAME_ = 'cv-input';

dotprod.views.ChatView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  var chatDiv = goog.dom.createElement('div');
  chatDiv.appendChild(this.chatBox_);
  rootNode.appendChild(chatDiv);
};

/**
 * @param {string} name
 * @param {function(string)} handler
 */
dotprod.views.ChatView.prototype.registerHandler = function(name, handler) {
  if (this.handlers_[name]) {
    this.handlers_[name].push(handler);
  } else {
    this.handlers_[name] = [handler];
  }
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
dotprod.views.ChatView.prototype.onChatLostFocus_ = function(event) {
  var node = event.target;
  window.setTimeout(function() {
    node.focus();
  }, 0);
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
dotprod.views.ChatView.prototype.onKeyPress_ = function(event) {
  if (event.keyCode != goog.events.KeyCodes.ENTER) {
    return;
  }

  // The chat box is hidden -- show it and set focus on enter press.
  if (this.chatBox_.style.opacity == 0) {
    this.chatBox_.value = '';
    this.chatBox_.style.opacity = 1;
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
      this.messages_.addMessage(this.playerIndex_.getLocalPlayer(), message);
    }
  }
  this.chatBox_.value = '';
  this.chatBox_.style.opacity = 0;
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
dotprod.views.ChatView.prototype.keyFilter_ = function(event) {
  if (this.chatBox_.style.opacity == 1) {
    event.stopPropagation();
  }
};
