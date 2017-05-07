import Game from 'ui/Game';
import Menu from 'ui/Menu';
import PlayerList from 'model/PlayerList';

export default class ScoreboardMenu implements Menu {
  private static readonly NAME_CLASS_NAME_ = 'sv-name';
  private static readonly SCORE_CLASS_NAME_ = 'sv-score';
  private static readonly FRIEND_CLASS_NAME_ = 'sv-row-friend';
  private static readonly FOE_CLASS_NAME_ = 'sv-row-foe';

  private view_ : HTMLDivElement;
  private playerList_ : PlayerList;

  constructor(game : Game) {
    this.view_ = <HTMLDivElement> document.getElementById('sv');
    this.playerList_ = game.simulation.playerList;
  }

  public get rootNode() : HTMLElement {
    return this.view_;
  }

  public update() {
    if (!this.view_.parentNode) {
      return;
    }

    this.view_.innerHTML = '';

    let self = this;
    let localPlayer = this.playerList_.localPlayer;
    let compareFn = function (p1, p2) {
      return p2.points - p1.points;
    };

    this.playerList_.forEach(function (player) {
      let nameNode = document.createElement('span');
      nameNode.classList.add(ScoreboardMenu.NAME_CLASS_NAME_);
      nameNode.textContent = player.name;

      let scoreNode = document.createElement('span');
      scoreNode.classList.add(ScoreboardMenu.SCORE_CLASS_NAME_);
      scoreNode.textContent = '' + player.points;

      let container = document.createElement('div');
      container.classList.add(player.isFriend(localPlayer) ? ScoreboardMenu.FRIEND_CLASS_NAME_ : ScoreboardMenu.FOE_CLASS_NAME_);
      container.appendChild(nameNode);
      container.appendChild(scoreNode);

      self.view_.appendChild(container);
    }, compareFn);
  }
}
