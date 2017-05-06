import Menu from 'ui/Menu';

export default class HelpMenu implements Menu {
  private readonly rootNode_ : HTMLDivElement;

  constructor() {
    this.rootNode_ = <HTMLDivElement> document.getElementById('help');
  }

  get rootNode() : HTMLDivElement {
    return this.rootNode_;
  }
}