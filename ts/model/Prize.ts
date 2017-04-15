import ModelObject from 'model/ModelObject';
import { PrizeType, TileType } from 'types';
import Simulation from 'model/Simulation';
import Map from 'model/Map';

export default class Prize extends ModelObject {
  private map_ : Map;
  private type_ : PrizeType;
  private xTile_ : number;
  private yTile_ : number;
  private ttl_ : number;
  constructor(simulation : Simulation, map : Map, type : PrizeType, xTile : number, yTile : number, ttl : number) {
    super(simulation);

    this.map_ = map;
    this.type_ = type;
    this.xTile_ = xTile;
    this.yTile_ = yTile;
    this.ttl_ = ttl;

    this.map_.setTile(xTile, yTile, TileType.PRIZE);
  }

  public getType() : PrizeType {
    return this.type_;
  }

  public getX() : number {
    return this.xTile_;
  }

  public getY() : number {
    return this.yTile_;
  }

  public advanceTime(fastForwardTicks? : number) {
    let ticks = (fastForwardTicks === undefined) ? 1 : fastForwardTicks;
    this.ttl_ = Math.max(0, this.ttl_ - ticks);
    if (this.ttl_ == 0) {
      this.invalidate();
    }
  }

  protected onInvalidate_() {
    this.map_.setTile(this.xTile_, this.yTile_, 0);
  }
}
