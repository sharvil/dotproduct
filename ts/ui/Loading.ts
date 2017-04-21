import ResourceManager from 'ResourceManager';

export default class Loading {
  private resourceManager_ : ResourceManager;
  private onLoadCompleteCb_ : VoidFunction;
  private container_ : HTMLDivElement;
  private progressBar_ : HTMLDivElement;
  private progressBarValue_ : HTMLDivElement;

  constructor(resourceManager : ResourceManager, onLoadCompleteCb : VoidFunction) {
    this.resourceManager_ = resourceManager;
    this.onLoadCompleteCb_ = onLoadCompleteCb;
    this.container_ = <HTMLDivElement> document.getElementById('loading');
    this.progressBar_ = <HTMLDivElement> document.getElementById('ldv-progress');
    this.progressBarValue_ = <HTMLDivElement> document.getElementById('ldv-progress-value');

    this.setLoadPercent_(0);
    this.container_.style.display = 'block';
  }

  public load(resources) {
    let self = this;
    let totalResources = 0;
    let loadedResources = 0;
    let completionCb = function() {
      self.setLoadPercent_(++loadedResources / totalResources * 100);
      if (loadedResources == totalResources) {
        self.container_.style.display = 'none';
        self.onLoadCompleteCb_();
      }
    };

    for (let name in resources['images']) {
      let resource = resources['images'][name];
      this.resourceManager_.loadImage(name, resource['url'], resource['xTiles'], resource['yTiles'], completionCb);
      ++totalResources;
    }

    for (let name in resources['spritesheets']) {
      let resource = resources['spritesheets'][name];
      this.resourceManager_.loadSpriteSheet(name, resource['url'], resource['xTiles'], resource['yTiles'], resource['frames'], resource['period'], completionCb);
      ++totalResources;
    }

    for (let name in resources['sounds']) {
      let resource = resources['sounds'][name];
      this.resourceManager_.loadSound(name, resource['url'], completionCb);
      ++totalResources;
    }
  }

  private setLoadPercent_(percent : number) {
    this.progressBarValue_.style.width = percent + '%';
  }
}
