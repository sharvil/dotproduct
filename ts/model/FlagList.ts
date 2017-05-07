import Flag from 'model/Flag';
import Map from 'model/Map';
import Simulation from 'model/Simulation';

export default class FlagList {
  private simulation_ : Simulation;
  private map_ : Map;
  private flags_ : Array<Flag>;

  constructor(simulation : Simulation, map : Map) {
    this.simulation_ = simulation;
    this.map_ = map;
    this.flags_ = [];
  }

  public getFlag(xTile : number, yTile : number) : Flag | undefined {
    return this.flags_.find(function (flag : Flag) {
      return flag.getX() == xTile && flag.getY() == yTile;
    });
  }

  public updateFlag = function (id : number, team : number, xTile : number, yTile : number) {
    let flag = this.getFlag(xTile, yTile);
    if (!flag) {
      this.flags_.push(new Flag(this.simulation_.playerList.localPlayer, this.map_, id, team, xTile, yTile));
    } else {
      flag.captureFlag(team);
    }
  }
}
