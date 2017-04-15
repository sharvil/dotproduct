import { TileType } from 'types';
import Game from 'ui/Game';
import Map from 'model/Map';
import LocalPlayer from 'model/player/LocalPlayer';

export default class Flag {
  private localPlayer_: LocalPlayer;
  private map_ : Map;
  private id_ : number;
  private team_ : number;
  private xTile_ : number;
  private yTile_ : number;

  constructor(game : Game, map : Map, id : number, team : number, xTile : number, yTile : number) {
    this.localPlayer_ = game.getPlayerIndex().getLocalPlayer();
    this.map_ = map;
    this.id_ = id;
    this.team_ = team;
    this.xTile_ = xTile;
    this.yTile_ = yTile;

    this.map_.setTile(xTile, yTile, this.getTileType_());
  }

  public getId() : number {
    return this.id_;
  }

  public getX() : number {
    return this.xTile_;
  }

  public getY() : number {
    return this.yTile_;
  }

  // Returns true if flag ownership changed, false otherwise.
  public captureFlag(team : number) : boolean {
    let changedOwnership = (this.team_ != team);
    this.team_ = team;
    this.map_.setTile(this.xTile_, this.yTile_, this.getTileType_());
    return changedOwnership;
  }

  private getTileType_() : TileType {
    return (this.localPlayer_.getTeam() == this.team_) ? TileType.FRIEND_FLAG : TileType.FOE_FLAG;
  }
}
