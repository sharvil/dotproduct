/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.ChatView');

goog.require('goog.events.BrowserEvent');
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
   * @type {!HTMLInputElement}
   * @private
   */
  this.chatBox_ = /** @type {!HTMLInputElement} */ (goog.dom.createElement('input'));
  this.chatBox_.className = dotprod.views.ChatView.CHAT_BOX_CLASS_NAME_;
  goog.events.listen(this.chatBox_, 'blur', goog.bind(this.onChatLostFocus_, this));
  goog.events.listen(window, goog.events.EventType.KEYPRESS, goog.bind(this.onKeyPress_, this));
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
  rootNode.appendChild(chatDiv)
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
dotprod.views.ChatView.prototype.onChatLostFocus_ = function(event) {
  var node = event.target;
  window.setTimeout(function() {
    node.focus();
  });
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
dotprod.views.ChatView.prototype.onKeyPress_ = function(event) {
  if (event.keyCode == goog.events.KeyCodes.ENTER) {
    if (this.chatBox_.style.opacity == 0) {
      this.chatBox_.value = '';
      this.chatBox_.style.opacity = 1;
      this.chatBox_.focus();
    } else {
      if (this.chatBox_.value != '') {
        var message = this.chatBox_.value;
        this.protocol_.sendChat(message);
        this.messages_.addMessage('[' + this.settings_['name'] + '] ' + message);
      }
      this.chatBox_.value = '';
      this.chatBox_.style.opacity = 0;
    }
  }
};

