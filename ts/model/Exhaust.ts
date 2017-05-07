import Vector from 'math/Vector';
import Viewport from 'Viewport';
import ModelObject from 'model/ModelObject';
import Simulation from 'model/Simulation';

export default class Exhaust extends ModelObject {
  private position_ : Vector;
  private velocity_ : Vector;
  private countdown_ : number;

  constructor(simulation : Simulation, position : Vector, velocity : Vector) {
    super(simulation);

    this.position_ = position;
    this.velocity_ = velocity;

    this.countdown_ = 19 * 2;
  }

  public advanceTime() {
    if (--this.countdown_ == 0) {
      this.invalidate();
      return;
    }

    // Slow down the animation.
    if (this.countdown_ % 2) {
      return;
    }

    this.position_ = this.position_.add(this.velocity_);
    this.velocity_ = this.velocity_.scale(0.75);
  }

  public get position() : Vector { return this.position_; }
  public get frame() : number { return 18 - Math.ceil(this.countdown_ / 2); }
}
