export default class Timer {
  private static readonly TICK_PERIOD_ = 10;

  private timeoutId_ : number | null;
  private intervalId_ : number | null;

  constructor() {
    this.timeoutId_ = null;
    this.intervalId_ = null;
  }

  public setTimeout(callback : VoidFunction, timeout_ticks : number) {
    this.clear();
    this.timeoutId_ = setTimeout(callback, timeout_ticks * Timer.TICK_PERIOD_);
  }

  public setInterval(callback : VoidFunction, interval_ticks : number) {
    this.clear();
    this.intervalId_ = setInterval(callback, interval_ticks * Timer.TICK_PERIOD_);
  }

  public clear() {
    if (this.timeoutId_ != null) {
      clearTimeout(this.timeoutId_);
      this.timeoutId_ = null;
    }

    if (this.intervalId_ != null) {
      clearInterval(this.intervalId_);
      this.intervalId_ = null;
    }
  }

  public static setInterval(cb : VoidFunction, timeout : number) : number {
    return window.setInterval(cb, timeout * Timer.TICK_PERIOD_);
  }

  public static clearInterval(intervalTimer : number) {
    window.clearInterval(intervalTimer);
  }

  public static millisToTicks(millis : number) : number {
    return Math.floor(millis / Timer.TICK_PERIOD_);
  }

  public static ticksToMillis(ticks : number) : number {
    return ticks * Timer.TICK_PERIOD_;
  }
}
