import Game from 'ui/Game';
import PlayerIndex from 'model/PlayerIndex';

export default class Scoreboard {
  private static readonly VISIBLE_CLASS_NAME_ = 'sv-visible';
  private static readonly NAME_CLASS_NAME_ = 'sv-name';
  private static readonly SCORE_CLASS_NAME_ = 'sv-score';
  private static readonly FRIEND_CLASS_NAME_ = 'sv-row-friend';
  private static readonly FOE_CLASS_NAME_ = 'sv-row-foe';

  private view_ : HTMLDivElement;
  private playerIndex_ : PlayerIndex;

  constructor(game : Game) {
    this.view_ = <HTMLDivElement> document.getElementById('sv');
    this.playerIndex_ = game.getPlayerIndex();
  }

  public show() {
    this.view_.classList.add(Scoreboard.VISIBLE_CLASS_NAME_);
  }

  public hide() {
    this.view_.classList.remove(Scoreboard.VISIBLE_CLASS_NAME_);
  }

  public update() {
    if (!this.view_.classList.contains(Scoreboard.VISIBLE_CLASS_NAME_)) {
      return;
    }

    this.view_.innerHTML = '';

    let self = this;
    let localPlayer = this.playerIndex_.getLocalPlayer();
    let compareFn = function (p1, p2) {
      return p2.getPoints() - p1.getPoints();
    };

    this.playerIndex_.forEach(function (player) {
      let nameNode = document.createElement('span');
      nameNode.classList.add(Scoreboard.NAME_CLASS_NAME_);
      nameNode.textContent = player.getName();

      let scoreNode = document.createElement('span');
      scoreNode.classList.add(Scoreboard.SCORE_CLASS_NAME_);
      scoreNode.textContent = player.getPoints();

      let container = document.createElement('div');
      container.classList.add(player.isFriend(localPlayer) ? Scoreboard.FRIEND_CLASS_NAME_ : Scoreboard.FOE_CLASS_NAME_);
      container.appendChild(nameNode);
      container.appendChild(scoreNode);

      self.view_.appendChild(container);
    }, compareFn);
  }
}
