import Font from 'Font';
import Drawable from 'graphics/Drawable';
import { Layer } from 'graphics/Layer';
import ModelObject from 'model/ModelObject';
import Palette from 'Palette';
import Notifications from 'Notifications';
import Viewport from 'Viewport';
import Game from 'ui/Game';

export default class NotificationLayer extends ModelObject implements Drawable {
  private static readonly MESSAGE_PERIOD_ : number = 150;
  private static readonly FADE_PERIOD_ : number = 50;

  private game_ : Game;
  private notifications_ : Notifications;

  constructor(game : Game, notifications : Notifications) {
    super(game.getSimulation());

    this.game_ = game;
    this.notifications_ = notifications;

    game.getPainter().registerDrawable(Layer.HUD, this);
  }

  public advanceTime() {
    this.notifications_.forEach(function (message, index) {
      ++message.ticks;
    });
  }

  public render(viewport : Viewport) {
    var context = viewport.getContext();
    var font = Font.notificationsFont();

    context.save();
    context.font = font.toString();

    this.notifications_.forEach(function (message, index) {
      if (message.ticks >= NotificationLayer.MESSAGE_PERIOD_ + NotificationLayer.FADE_PERIOD_) {
        return;
      }

      var opacity = 1;
      if (message.ticks > NotificationLayer.MESSAGE_PERIOD_) {
        opacity -= (message.ticks - NotificationLayer.MESSAGE_PERIOD_) / NotificationLayer.FADE_PERIOD_;
      }

      // TODO(sharvil): don't hard-code text position.
      switch (message.type) {
        case Notifications.Type.PERSONAL:
          context.fillStyle = Palette.personalNotificationsColor(opacity);
          break;
        case Notifications.Type.ENTER:
          context.fillStyle = Palette.enterNotificationsColor(opacity);
          break;
        default:
          context.fillStyle = Palette.notificationsColor(opacity);
          break;
      }
      context.textAlign = 'center';
      context.fillText(message.text, 400, index * font.getLineHeight() + 220);
    });

    context.restore();
  }

  protected onInvalidate_() {
    assert(false, 'Notification layer should never be invalidated.');
  }
}
