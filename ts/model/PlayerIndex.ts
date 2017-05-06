import LocalPlayer from 'model/player/LocalPlayer';
import Player from 'model/player/Player';

export default class PlayerIndex {
  private players_ : Map<string, Player>;
  private localPlayer_ : LocalPlayer;

  constructor(localPlayer : LocalPlayer) {
    this.players_ = new Map<string, Player>();
    this.localPlayer_ = localPlayer;

    this.addPlayer(localPlayer);
  }

  public addPlayer(player: Player) {
    this.players_.set(player.id, player);
  }

  public removePlayer(player : Player) {
    player.invalidate();
    this.players_.delete(player.id);
  }

  public findById(id : string) : Player | undefined {
    return this.players_.get(id);
  }

  public getCount() : number {
    return this.players_.size;
  }

  public forEach(cb : (p : Player) => void, compareFn? : (p1 : Player, p2 : Player) => number) {
    let players = Array.from(this.players_.values());
    if (compareFn) {
      players.stableSort(compareFn);
    }
    players.forEach(cb);
  }

  public some(cb : (p : Player) => boolean) {
    Array.from(this.players_.values()).some(cb);
  }

  public getLocalPlayer() : LocalPlayer {
    return this.localPlayer_;
  }
}
