import Game from 'ui/Game';
import Key from 'input/Key';
import HelpMenu from 'ui/HelpMenu';
import Listener from 'Listener';
import Menu from 'ui/Menu';
import ScoreboardMenu from 'ui/ScoreboardMenu';
import ShipSelectMenu from 'ui/ShipSelectMenu';

export default class MenuBar {
  private readonly helpMenu_ : HelpMenu;
  private readonly scoreMenu_ : ScoreboardMenu;
  private readonly shipSelectMenu_ : ShipSelectMenu;
  private readonly menuRoot_: HTMLDivElement;
  private currentMenu_: Menu | null;

  constructor(game : Game) {
    this.helpMenu_ = new HelpMenu();
    this.scoreMenu_ = new ScoreboardMenu(game);
    this.shipSelectMenu_ = new ShipSelectMenu(this, game);
    this.menuRoot_ = <HTMLDivElement>document.getElementById('menu');
    this.currentMenu_ = null;

    Listener.add(game.getKeyboard(), Key.Code.ESCAPE, this.eventHandler_.bind(this));
    Listener.add(game.getKeyboard(), Key.Code.ZERO, this.eventHandler_.bind(this));
    Listener.add(game.getKeyboard(), Key.Code.NINE, this.eventHandler_.bind(this));
    Listener.add(game.getKeyboard(), Key.Code.QUESTION_MARK, this.eventHandler_.bind(this));
  }

  /**
   * Called by Menus when they would like to be dismissed. Does nothing if the specified
   * menu is not currently being displayed (i.e. the menu is already dismissed).
   */
  public dismiss(menu : Menu) {
    if (this.currentMenu_ == menu) {
      this.dismiss_();
    }
  }

  private eventHandler_(target: any, code: Key.Code) {
    // Escape will always dismiss whatever menu is showing.
    if (code == Key.Code.ESCAPE) {
      this.dismiss_();
      return;
    }

    let menu : Menu | null = null;
    switch (code) {
      case Key.Code.ZERO:
        menu = this.scoreMenu_;
        break;
      case Key.Code.NINE:
        menu = this.shipSelectMenu_;
        break;
      case Key.Code.QUESTION_MARK:
        menu = this.helpMenu_;
        break;
    }

    if (this.currentMenu_ == menu) {
      this.dismiss_();
    } else if (menu) {
      this.show_(menu);
    }
  }

  private show_(item : Menu) {
    if (this.currentMenu_) {
      this.dismiss_();
    }
    this.currentMenu_ = item;
    this.currentMenu_.rootNode.classList.add('visible');
  }

  private dismiss_() {
    if (!this.currentMenu_) {
      return;
    }
    this.currentMenu_.rootNode.classList.remove('visible');
    this.currentMenu_ = null;
  }
}
