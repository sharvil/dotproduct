import Listener from 'Listener';
import Key from 'input/Key';

export default class Keyboard {
  private keys_ : Set<number>;

  constructor() {
    this.keys_ = new Set();

    document.addEventListener('visibilitychange', this.documentVisibilityChanged_.bind(this));
    window.addEventListener('keypress', this.keyPressed_.bind(this));
    window.addEventListener('keydown', this.keyDown_.bind(this));
    window.addEventListener('keyup', this.keyUp_.bind(this));
  }

  public isKeyPressed(keyCode : number) {
    return this.keys_.has(keyCode);
  }

  private keyPressed_(e : KeyboardEvent) {
    Listener.fire(this, e.keyCode);
  }

  private keyDown_(e : KeyboardEvent) {
    Listener.fire(this, e.keyCode);

    if (e.keyCode == Key.Code.LEFT || e.keyCode == Key.Code.RIGHT ||
        e.keyCode == Key.Code.UP || e.keyCode == Key.Code.DOWN ||
        e.keyCode == Key.Code.TAB || e.keyCode == Key.Code.BACKSPACE) {
      e.preventDefault();
    }
    this.keys_.add(e.keyCode);
  }

  private keyUp_(e : KeyboardEvent) {
    this.keys_.delete(e.keyCode);
  }

  private documentVisibilityChanged_(event : Event) {
    if (document.hidden) {
      this.keys_.clear();
    }
  }
}
