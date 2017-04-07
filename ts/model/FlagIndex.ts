import Flag from 'model/Flag';
import Game from 'ui/Game';

export default class FlagIndex {
  private game_ : Game;
  private flags_ : Array<Flag>;

  constructor(game : Game) {
    this.game_ = game;
    this.flags_ = [];
  }

  public getFlag(xTile : number, yTile : number) : Flag | undefined {
    return this.flags_.find(function (flag : Flag) {
      return flag.getX() == xTile && flag.getY() == yTile;
    });
  }

  public updateFlag = function (id : number, team : number, xTile : number, yTile : number) {
    var flag = this.getFlag(xTile, yTile);
    if (!flag) {
      this.flags_.push(new Flag(this.game_, this.game_.getMap(), id, team, xTile, yTile));
    } else {
      flag.captureFlag(team);
    }
  }
}
