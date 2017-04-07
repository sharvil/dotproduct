import Simulation from 'model/Simulation';

abstract class ModelObject {
  protected simulation_ : Simulation;
  private isValid_ : boolean;

  constructor(simulation : Simulation) {
    this.simulation_ = simulation;
    this.isValid_ = true;

    this.simulation_.registerObject(this);
  }

  public abstract advanceTime() : void;
  protected onInvalidate_() {}

  public isValid() : boolean {
    return this.isValid_;
  }

  public invalidate() {
    assert(this.isValid_, 'Duplicate invalidation of model object.');

    this.isValid_ = false;
    this.simulation_.unregisterObject(this);
    this.onInvalidate_();
  }
}

export default ModelObject;
