import LocalPlayer from 'model/player/LocalPlayer';
import Player from 'model/player/Player';

enum Type {
  DEFAULT = 1,
  PERSONAL = 2,
  ENTER = 3
}

export default class Notifications {
  public static readonly Type = Type;

  private static readonly MAX_MESSAGES_ : number = 5;

  private localPlayer_ : LocalPlayer;
  private messages_ : Array<any>;
  private insertIndex_ : number;

  constructor(localPlayer : LocalPlayer) {
    this.localPlayer_ = localPlayer;
    this.messages_ = [];
    this.insertIndex_ = 0;
  }

  public addMessage(message : string) {
    this.addMessage_(Type.DEFAULT, message);
  }

  public addPersonalMessage(message : string) {
    this.addMessage_(Type.PERSONAL, message);
  }

  public addEnterMessage(message : string) {
    this.addMessage_(Type.ENTER, message);
  }

  public forEach(callback : (any, number) => void) {
    this.messages_.forEach(callback);
  }

  private addMessage_(type : Type, message : string) {
    this.messages_[this.insertIndex_] = {
      type: type,
      text: message,
      ticks: 0
    };

    this.insertIndex_ = (this.insertIndex_ + 1) % Notifications.MAX_MESSAGES_;

    // Only show desktop notifications if the user isn't focused on the game.
    if (this.localPlayer_.hasPresence(Player.Presence.AWAY)) {
      let notification = new Notification('dotproduct', { icon: 'img/dotproduct_logo_128.png', body: message });
      setTimeout(notification.close.bind(notification), 5000);
    }
  }
}
