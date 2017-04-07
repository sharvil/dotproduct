import Rect from 'math/Rect';
import Timer from 'time/Timer';
import Vector from 'math/Vector';

export default class Mouse {
  private static readonly IDLE_TIMEOUT_TICKS_ = 300;

  private position_ : Vector;
  private timeout_ : Timer;

  constructor() {
    this.position_ = Vector.ZERO;
    this.timeout_ = new Timer();
    this.timeout_.setTimeout(this.onIdle_.bind(this), Mouse.IDLE_TIMEOUT_TICKS_);

    window.addEventListener('mousemove', this.onMotion_.bind(this));
  }

  // Returns true if the mouse cursor is hovering over the given rect, false otherwise.
  public isHovering(rect : Rect) {
    return this.position_ == Vector.ZERO ? false : rect.contains(this.position_);
  }

  private onMotion_(event : MouseEvent) {
    document.body.style.cursor = '';
    this.position_ = new Vector(event.offsetX, event.offsetY);
    this.timeout_.setTimeout(this.onIdle_.bind(this), Mouse.IDLE_TIMEOUT_TICKS_);
  }

  private onIdle_() {
    this.position_ = Vector.ZERO;
    document.body.style.cursor = 'none';
  }
}
