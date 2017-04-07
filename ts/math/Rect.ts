import Vector from 'math/Vector';

export default class Rect {
  private x_ : number;
  private y_ : number;
  private width_ : number;
  private height_ : number;

  constructor(x : number, y : number, width : number, height : number) {
    this.x_ = x;
    this.y_ = y;
    this.width_ = width;
    this.height_ = height;
  }

  public static fromBox(left : number, top : number, right : number, bottom : number) : Rect {
    return new Rect(left, top, right - left, bottom - top);
  }

  public get x() : number {
    return this.x_;
  }

  public get y() : number {
    return this.y_;
  }

  public get width() : number {
    return this.width_;
  }

  public get height() : number {
    return this.height_;
  }

  public get left() : number {
    return this.x_;
  }

  public get right() : number {
    return this.x_ + this.width_;
  }

  public get top() : number {
    return this.y_;
  }

  public get bottom() : number {
    return this.y_ + this.height_;
  }

  public contains(vec : Vector) : boolean {
    const x = vec.x;
    const y = vec.y;
    return x >= this.x_ && x <= this.x_ + this.width_ && y >= this.y_ && y <= this.y_ + this.height_;
  }
}
