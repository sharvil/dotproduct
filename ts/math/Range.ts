export default class Range {
  private low_ : number;
  private high_ : number;
  private increment_ : number;
  private value_ : number;

  constructor(low : number, high : number, increment : number) {
    assert(low <= high, 'Cannot construct a range where low > high.');

    this.low_ = low;
    this.high_ = high;
    this.increment_ = increment;
    this.value_ = low;
  }

  public static fromArray(array : Array<number>) {
    assert(array.length == 3, 'Range can only be constructed from ararys of length 3.');

    return new Range(array[0], array[1], array[2]);
  }

  public increment() : boolean {
    this.value_ = Math.min(this.value_ + this.increment_, this.high_);
    return this.isHigh();
  }

  public decrement() : boolean {
    this.value_ = Math.max(this.value_ - this.increment_, this.low_);
    return this.isLow();
  }

  public isLow() : boolean {
    return this.value_ == this.low_;
  }

  public isHigh() : boolean {
    return this.value_ == this.high_;
  }

  public setLow() {
    this.value_ = this.low_;
  }

  public setHigh() {
    this.value_ = this.high_;
  }

  public getLow() : number {
    return this.low_;
  }

  public getHigh() : number {
    return this.high_;
  }

  public getValue() : number {
    return this.value_;
  }

  public setValue(value : number) {
    if (value < this.low_) {
      this.value_ = this.low_;
    } else if (value > this.high_) {
      this.value_ = this.high_;
    } else {
      this.value_ = value;
    }
  }
}
