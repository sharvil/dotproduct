import Game from 'ui/Game';
import LocalPlayer from 'model/player/LocalPlayer';
import Player from 'model/player/Player';
import Protocol from 'net/Protocol';
import Key from 'input/Key';

export default class Chat {
  private static readonly TEXT_NAME_CLASS_NAME_ = 'cv-text-name';
  private static readonly TEXT_MESSAGE_CLASS_NAME_ = 'cv-text-message';
  private static readonly SYSTEM_MESSAGE_CLASS_NAME_ = 'cv-system-message';
  private static readonly CHAT_BOX_VISIBLE_CLASS_NAME_ = 'cv-visible';

  private localPlayer_ : LocalPlayer;
  private protocol_ : Protocol;
  private view_ : HTMLDivElement;
  private text_ : HTMLDivElement;
  private chatBox_ : HTMLInputElement;

  constructor(game : Game) {
    this.localPlayer_ = game.getPlayerList().localPlayer;
    this.protocol_ = game.getProtocol();
    this.view_ = <HTMLDivElement> document.getElementById('cv');
    this.text_ = <HTMLDivElement> document.getElementById('cv-text');
    this.chatBox_ = <HTMLInputElement> document.getElementById('cv-input');

    window.addEventListener('keypress', this.onGlobalKeyPress_.bind(this));
    this.chatBox_.addEventListener('keypress', this.onChatKeyPress_.bind(this));
    this.chatBox_.addEventListener('keydown', this.keyFilter_.bind(this));
    this.chatBox_.addEventListener('keyup', this.keyFilter_.bind(this));
    this.chatBox_.addEventListener('blur', () => { this.localPlayer_.clearPresence(Player.Presence.TYPING); });
    this.chatBox_.addEventListener('focus', () => { this.localPlayer_.setPresence(Player.Presence.TYPING); });
  }

  public addMessage(player : Player, message : string) {
    let isAtBottom = this.view_.scrollTop + this.view_.offsetHeight >= this.view_.scrollHeight;

    let messageNode = document.createElement('div');

    let nameNode = document.createElement('span');
    nameNode.classList.add(Chat.TEXT_NAME_CLASS_NAME_);
    nameNode.textContent = player.name + ': ';
    nameNode.addEventListener('click', this.onNameClicked_.bind(this, player));

    let textNode = document.createElement('span');
    textNode.classList.add(Chat.TEXT_MESSAGE_CLASS_NAME_);
    textNode.textContent = message;
    textNode.innerHTML = window['linkify'](textNode.innerHTML);

    messageNode.appendChild(nameNode);
    messageNode.appendChild(textNode);

    this.text_.appendChild(messageNode);
    if (isAtBottom) {
      this.view_.scrollTop = this.view_.scrollHeight;
    }
  }

  public addSystemMessage(message : string) {
    let isAtBottom = this.view_.scrollTop + this.view_.offsetHeight >= this.view_.scrollHeight;

    let messageNode = document.createElement('div');
    messageNode.classList.add(Chat.SYSTEM_MESSAGE_CLASS_NAME_);
    messageNode.textContent = message;
    messageNode.innerHTML = window['linkify'](messageNode.innerHTML);

    this.text_.appendChild(messageNode);
    if (isAtBottom) {
      this.view_.scrollTop = this.view_.scrollHeight;
    }
  }

  /** Sets the position of the right edge of the chat view. */
  public setRightPosition(position : number) {
    this.view_.style.right = position + 'px';
  }

  public isChatBoxVisible() : boolean {
    return this.chatBox_.classList.contains(Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
  }

  private onGlobalKeyPress_(event : KeyboardEvent) {
    if (event.keyCode == Key.Code.ZERO) {
      this.view_.classList.toggle('cv-expanded');
    } else if (event.keyCode == Key.Code.ENTER) {
      this.chatBox_.classList.add(Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
      this.chatBox_.focus();
    }
  }

  private onChatKeyPress_(event : KeyboardEvent) {
    event.stopPropagation();

    if (event.keyCode != Key.Code.ENTER) {
      return;
    }

    let message = this.chatBox_.value.trim();
    if (message != '') {
      let command = message.split(' ')[0];
      this.protocol_.sendChat(message);
      this.addMessage(this.localPlayer_, message);
    }

    this.chatBox_.value = '';
    this.chatBox_.blur();
    this.chatBox_.classList.remove(Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
  }

  private keyFilter_(event : KeyboardEvent) {
    event.stopPropagation();

    // Chrome doesn't fire keypress events for the escape key so we have to handle it here instead.
    if (event.keyCode == Key.Code.ESCAPE) {
      this.chatBox_.value = '';
      this.chatBox_.blur();
      this.chatBox_.classList.remove(Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
      return;
    }
  }

  private onNameClicked_(player : Player) {
    this.chatBox_.classList.add(Chat.CHAT_BOX_VISIBLE_CLASS_NAME_);
    this.chatBox_.focus();

    if (this.chatBox_.value.length > 0 && this.chatBox_.value[this.chatBox_.value.length - 1] != ' ') {
      this.chatBox_.value += ' ';
    }
    this.chatBox_.value += '@' + player.name;
  }
}
