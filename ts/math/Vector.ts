export default class Vector {
  public static readonly ZERO : Vector = new Vector(0, 0);

  private readonly x_ : number;
  private readonly y_ : number;

  constructor(x : number, y : number) {
    this.x_ = x;
    this.y_ = y;
  }

  public static fromArray(array : Array<number>) : Vector {
    assert(array.length == 2, 'Cannot call toArray with array of length ' + array.length);
    return new Vector(array[0], array[1]);
  }

  public static fromPolar(r : number, theta : number) : Vector {
    return new Vector(r * Math.sin(theta), -r * Math.cos(theta));
  }

  public get x() : number {
    return this.x_;
  }

  public get y() : number {
    return this.y_;
  }

  public magnitude() : number {
    return Math.sqrt(this.x_ * this.x_ + this.y_ * this.y_);
  }

  public add(vector : Vector) : Vector {
    return new Vector(this.x_ + vector.x_, this.y_ + vector.y_);
  }

  public subtract(vector : Vector) : Vector {
    return new Vector(this.x_ - vector.x_, this.y_ - vector.y_);
  }

  public scale(factor : number) : Vector {
    return new Vector(this.x_ * factor, this.y_ * factor);
  }

  // |angle| is in radians.
  public rotate(angle : number) : Vector {
    const x = -Math.sin(angle) * (this.x_ + this.y_);
    const y = -Math.cos(angle) * (this.x_ - this.y_);

    return new Vector(x, y);
  }

  public resize(newMagnitude : number) : Vector {
    const currentMagnitude = this.magnitude();
    assert(currentMagnitude != 0, 'Cannot resize a zero-vector.');

    return new Vector(this.x_ * newMagnitude / currentMagnitude, this.y_ * newMagnitude / currentMagnitude);
  }

  public toArray() : Array<number> {
    return [this.x_, this.y_];
  }

  public toString() : string {
    return "[" + this.x_ + ", " + this.y_ + "]";
  }
}
