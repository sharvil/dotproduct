import Flag from 'model/Flag';
import LocalPlayer from 'model/player/LocalPlayer';
import Map from 'model/Map';

export default class FlagList {
  private localPlayer_ : LocalPlayer;
  private map_ : Map;
  private flags_ : Array<Flag>;

  constructor(localPlayer : LocalPlayer, map : Map) {
    this.localPlayer_ = localPlayer;
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
      this.flags_.push(new Flag(this.localPlayer_, this.map_, id, team, xTile, yTile));
    } else {
      flag.captureFlag(team);
    }
  }
}
