import ModelObject from 'model/ModelObject';
import ModelObjectFactory from 'model/ModelObjectFactory';
import Timer from 'time/Timer';

export default class Simulation {
  private modelObjectFactory_ : ModelObjectFactory;
  private registeredObjects_ : Array<ModelObject>;
  private timeMillis_ : number;

  constructor(modelObjectFactory : ModelObjectFactory) {
    this.modelObjectFactory_ = modelObjectFactory;
    this.registeredObjects_ = [];
    this.timeMillis_ = 0;
  }

  public registerObject(obj : ModelObject) {
    assert(obj.isValid(), 'Cannot register an invalid object.');
    this.registeredObjects_.push(obj);
  }

  public unregisterObject(obj : ModelObject) {
    this.registeredObjects_.remove(obj);
  }

  public advanceTime() {
    // Start counting time from the first tick of the simulation instead of
    // when this object was constructed. Doing it this way makes sure we don't
    // have a clock bias due to the delay from object construction -> first tick.
    if (!this.timeMillis_) {
      this.timeMillis_ = Date.now();
    } else {
      this.timeMillis_ += Timer.ticksToMillis(1);
    }

    let objectSnapshot = Array.from(this.registeredObjects_);
    objectSnapshot.forEach(function (obj) {
      obj.advanceTime();
    });
  }

  public getTimeMillis() : number {
    return this.timeMillis_;
  }
}
