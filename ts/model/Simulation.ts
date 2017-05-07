import FlagList from 'model/FlagList';
import Game from 'ui/Game';
import Map from 'model/Map';
import ModelObject from 'model/ModelObject';
import ModelObjectFactory from 'model/ModelObjectFactory';
import PlayerList from 'model/PlayerList';
import PrizeList from 'model/PrizeList';
import Timer from 'time/Timer';

export default class Simulation {
  // State used to move simulation forward.
  private modelObjectFactory_ : ModelObjectFactory;
  private registeredObjects_ : Array<ModelObject>;
  private timeMillis_ : number;

  // Simulation model state.
  private map_ : Map;
  private playerList_ : PlayerList;
  private flagList_ : FlagList;
  private prizeList_: PrizeList;
  private settings_ : Object;

  constructor(game : Game, modelObjectFactory : ModelObjectFactory, settings : Object, mapData : any, tileProperties : Array<Object>) {
    this.modelObjectFactory_ = modelObjectFactory;
    this.registeredObjects_ = [];
    this.timeMillis_ = 0;
    this.settings_ = settings;
    this.map_ = new Map(settings, mapData, tileProperties);

    let startingShip = Math.floor(Math.random() * settings['ships'].length);
    let localPlayer = this.modelObjectFactory_.newLocalPlayer(this, settings['id'], settings['name'], settings['team'], startingShip);
    this.playerList_ = new PlayerList(localPlayer);

    this.flagList_ = new FlagList(this, this.map_);
    this.prizeList_ = new PrizeList(this, settings, this.map_);
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

  public get modelObjectFactory() : ModelObjectFactory { return this.modelObjectFactory_; }
  public get map() : Map { return this.map_; }
  public get playerList(): PlayerList { return this.playerList_; }
  public get flagList() : FlagList { return this.flagList_; }
  public get prizeList() : PrizeList { return this.prizeList_; }
  public get settings() : Object { return this.settings_; }
}
