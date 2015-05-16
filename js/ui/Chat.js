goog.provide('ui.Chat');

goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('net.Protocol');

/**
 * @constructor
 * @param {!Game} game
 */
ui.Chat = function(game) {
  /**
   * @type {!model.player.LocalPlayer}
   * @private
   */
  this.localPlayer_ = game.getPlayerIndex().getLocalPlayer();

  /**
   * @type {!net.Protocol}
   * @private
   */
  this.protocol_ = game.getProtocol();

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.view_ = /** @type {!HTMLDivElement} */ (goog.dom.getElement('cv'));

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.text_ = /** @type {!HTMLDivElement} */ (goog.dom.getElement('cv-text'));

  /**
   * @type {!HTMLInputElement}
   * @private
   */
  this.chatBox_ = /** @type {!HTMLInputElement} */ (goog.dom.getElement('cv-input'));

  goog.events.listen(window, goog.events.EventType.KEYPRESS, this.onGlobalKeyPress_.bind(this));
  goog.events.listen(this.chatBox_, goog.events.EventType.KEYPRESS, this.onChatKeyPress_.bind(this));
  goog.events.listen(this.chatBox_, goog.events.EventType.KEYDOWN, this.keyFilter_.bind(this));
  goog.events.listen(this.chatBox_, goog.events.EventType.KEYUP, this.keyFilter_.bind(this));

  var self = this;
  goog.events.listen(this.chatBox_, goog.events.EventType.BLUR, function() { self.localPlayer_.clearPresence(model.player.Player.Presence.TYPING); });
  goog.events.listen(this.chatBox_, goog.events.EventType.FOCUS, function() { self.localPlayer_.setPresence(model.player.Player.Presence.TYPING); });
};

/**
 * @type {string}
 * @private
 * @const
 */
ui.Chat.TEXT_NAME_CLASS_NAME_ = 'cv-text-name';

/**
 * @type {string}
 * @private
 * @const
 */
ui.Chat.TEXT_MESSAGE_CLASS_NAME_ = 'cv-text-message';

/**
 * @type {string}
 * @private
 * @const
 */
ui.Chat.SYSTEM_MESSAGE_CLASS_NAME_ = 'cv-system-message';

/**
 * @type {string}
 * @private
 * @const
 */
ui.Chat.CHAT_BOX_VISIBLE_CLASS_NAME_ = 'cv-visible';

/**
 * @param {!model.player.Player} player
 * @param {string} message
 */
ui.Chat.prototype.addMessage = function(player, message) {
  var isAtBottom = this.view_.scrollTop + this.view_.offsetHeight >= this.view_.scrollHeight;

  var messageNode = goog.dom.createElement('div');

  var nameNode = goog.dom.createElement('span');
  nameNode.classList.add(ui.Chat.TEXT_NAME_CLASS_NAME_);
  nameNode.textContent = player.getName() + ': ';
  goog.events.listen(nameNode, goog.events.EventType.CLICK, this.onNameClicked_.bind(this, player));

  var textNode = goog.dom.createElement('span');
  textNode.classList.add(ui.Chat.TEXT_MESSAGE_CLASS_NAME_);
  textNode.textContent = message;
  textNode.innerHTML = window.linkify(textNode.innerHTML);

  messageNode.appendChild(nameNode);
  messageNode.appendChild(textNode);

  this.text_.appendChild(messageNode);
  if (isAtBottom) {
    this.view_.scrollTop = this.view_.scrollHeight;
  }
};

/**
 * @param {string} message
 */
ui.Chat.prototype.addSystemMessage = function(message) {
  var isAtBottom = this.view_.scrollTop + this.view_.offsetHeight >= this.view_.scrollHeight;

  var messageNode = goog.dom.createElement('div');
  messageNode.classList.add(ui.Chat.SYSTEM_MESSAGE_CLASS_NAME_);
  messageNode.textContent = message;
  messageNode.innerHTML = window.linkify(messageNode.innerHTML);

  this.text_.appendChild(messageNode);
  if (isAtBottom) {
    this.view_.scrollTop = this.view_.scrollHeight;
  }
};

/**
 * Sets the position of the right edge of the chat view.
 *
 * @param {number} position
 */
ui.Chat.prototype.setRightPosition = function(position) {
  this.view_.style.right = position + 'px';
};

/**
 * @return {boolean}
 */
ui.Chat.prototype.isChatBoxVisible = function() {
  return this.chatBox_.classList.contains(ui.Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
};

ui.Chat.prototype.onGlobalKeyPress_ = function(event) {
  if (event.keyCode == goog.events.KeyCodes.NUM_ZERO) {
    this.view_.classList.toggle('cv-expanded');
  }

  if (event.keyCode != goog.events.KeyCodes.ENTER) {
    return;
  }

  this.chatBox_.classList.add(ui.Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
  this.chatBox_.focus();
};

ui.Chat.prototype.onChatKeyPress_ = function(event) {
  if (event.keyCode != goog.events.KeyCodes.ENTER) {
    return;
  }

  var message = this.chatBox_.value.trim();
  if (message != '') {
    var command = message.split(' ')[0];
    this.protocol_.sendChat(message);
    this.addMessage(this.localPlayer_, message);
  }

  this.chatBox_.value = '';
  this.chatBox_.blur();
  this.chatBox_.classList.remove(ui.Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
  event.stopPropagation();
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
ui.Chat.prototype.keyFilter_ = function(event) {
  // Chrome doesn't fire keypress events for the escape key so we have to handle it here instead.
  if (event.keyCode == goog.events.KeyCodes.ESC) {
    this.chatBox_.value = '';
    this.chatBox_.blur();
    this.chatBox_.classList.remove(ui.Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
    return;
  }

  if (this.isChatBoxVisible()) {
    event.stopPropagation();
  }
};

/**
 * @param {!model.player.Player} player
 * @private
 */
ui.Chat.prototype.onNameClicked_ = function(player) {
  this.chatBox_.classList.add(ui.Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
  this.chatBox_.focus();

  if (this.chatBox_.value.length > 0 && this.chatBox_.value[this.chatBox_.value.length - 1] != ' ') {
    this.chatBox_.value += ' ';
  }
  this.chatBox_.value += '@' + player.getName();
};
