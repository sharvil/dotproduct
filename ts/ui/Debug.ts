import Game from 'ui/Game';
import Viewport from 'Viewport';
import Labs from 'Labs';

export default class Debug {
  private game_ : Game;
  private viewport_ : Viewport;
  private view_ : HTMLDivElement;
  private lastTime_ : number;
  private frames_ : number;

  constructor(game : Game, viewport : Viewport) {
    this.game_ = game;
    this.viewport_ = viewport;
    this.view_ = <HTMLDivElement> document.getElementById('dv');
    this.lastTime_ = Date.now();
    this.frames_ = 0;
  }

  public update() {
    ++this.frames_;

    let now = Date.now();
    if (now - this.lastTime_ < 1000) {
      return;
    }

    let html = Labs.NEXT_GAME_VIEW ? this.getEventTimeString_() : '';
    if (html) {
      html += '<br><br>';
    }

    if (Labs.DEBUG_UI) {
      html += this.game_.getProtocol().getRoundTripTime() + 'ms, ' +
        this.frames_ + 'fps, ' +
        this.game_.getPlayerIndex().getCount();
    }

    this.view_.innerHTML = html;

    this.frames_ = 0;
    this.lastTime_ = now;
  }

  private getEventTimeString_() : string {
    let daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let today = new Date();
    let daysUntilThursday = (4 - today.getDay() + 7) % 7;
    let nextEventDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilThursday, 22));

    let delta = nextEventDate.getTime() - today.getTime();
    if (delta < 0) {
      if (delta > -1000 * 3600 * 2) {
        return '';
      }
      nextEventDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 7, 22));
      delta = nextEventDate.getTime() - today.getTime();
    }

    let days = Math.floor(delta / 24 / 3600 / 1000);
    let hours = Math.floor(delta / 3600 / 1000) % 24;
    let minutes = Math.floor(delta / 60 / 1000) % 60;
    let seconds = Math.floor(delta / 1000) % 60;

    let str = 'Next game';
    if (days > 0) {
      let pad = nextEventDate.getMinutes() < 10 ? '0' : '';
      let ampm = nextEventDate.getHours() >= 12 ? 'pm' : 'am';
      str += ' on ' + daysOfWeek[nextEventDate.getDay()] + ', ' + monthName[nextEventDate.getMonth()] + ' ' + nextEventDate.getDate() + ' at ' + (nextEventDate.getHours() % 12) + ':' + pad + nextEventDate.getMinutes() + ampm;
    } else {
      let sPad = seconds < 10 ? '0' : '';
      let mPad = minutes < 10 ? '0' : '';
      let hPad = hours < 10 ? '0' : '';
      str += ' starting in ' + hPad + hours + ':' + mPad + minutes + ':' + sPad + seconds;
    }
    return str;
  }
}
