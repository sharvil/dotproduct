export default class Disconnected {
  private view_ : HTMLDivElement;

  constructor() {
    this.view_ = <HTMLDivElement> document.getElementById('dcv');
    this.view_.addEventListener('click', this.onClick_.bind(this));
  }

  public show() {
    this.view_.style.display = 'block';
  }

  public hide() {
    this.view_.style.display = 'none';
  }

  private onClick_() {
    window.location.reload();
  }
}
