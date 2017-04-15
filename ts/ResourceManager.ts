import Image from 'graphics/Image';
import SpriteSheet from 'graphics/SpriteSheet';
import Sound from 'Sound';

export default class ResourceManager {
  private images_ : Map<string, Image>;
  private spriteSheets_ : Map<string, SpriteSheet>;
  private sounds_ : Map<string, Sound>;

  constructor() {
    this.images_ = new Map();
    this.spriteSheets_ = new Map();
    this.sounds_ = new Map();
  }

  public loadImage(name : string, url : string, xTiles : number, yTiles : number, loadCb : VoidFunction) {
    let self = this;
    let callback = function() {
      console.info('Loaded image: "' + name + '"');
      loadCb();
    };

    console.info('Loading image: "' + name + '" using URL: ' + url);
    this.images_[name] = new Image(xTiles, yTiles);
    this.images_[name].load(url, callback);
  }

  public loadSpriteSheet(name : string, url : string, xTiles : number, yTiles : number, frames : number, period : number, loadCb : VoidFunction) {
    let self = this;
    let callback = function() {
      console.info('Loaded sprite sheet: "' + name + '"');
      loadCb();
    };

    console.info('Loading sprite sheet: "' + name + '" using URL: ' + url);
    this.spriteSheets_[name] = new SpriteSheet(xTiles, yTiles, frames, period);
    this.spriteSheets_[name].load(url, callback)
  }

  public loadSound(name : string, url : string, loadCb : VoidFunction) {
    console.info('Loading sound: "' + name + '" using URL: ' + url);
    this.sounds_[name] = new Sound();
    this.sounds_[name].load(url, loadCb);
  }

  public playSound(name : string) {
    assert(name in this.sounds_, 'Unable to find sound: ' + name);
    this.sounds_[name].play();
  }

  public getImage(name) : Image {
    assert(this.images_[name], 'Requesting missing image resource: ' + name);
    return this.images_[name];
  }

  public getSpriteSheet(name : string) : SpriteSheet {
    assert(this.spriteSheets_[name], 'Requesting missing sprite sheet: ' + name);
    return this.spriteSheets_[name];
  }
}
