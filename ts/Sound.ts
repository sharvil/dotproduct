export default class Sound {
  private static audioContext_ : AudioContext = new AudioContext();
  private buffer_ : any | null;

  constructor() {
    this.buffer_ = null;
  }

  public load(url : string, loadCb : VoidFunction) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('load', this.onLoad_.bind(this, loadCb));
    xhr.send();
  }

  public play() {
    assert(!!this.buffer_, 'Unable to play sound before it\'s loaded.');

    let source = Sound.audioContext_.createBufferSource();
    source.buffer = this.buffer_;
    source.connect(Sound.audioContext_.destination);
    source.start();
  }

  private onLoad_(loadCb : VoidFunction, event : any) {
    let self = this;
    Sound.audioContext_.decodeAudioData(event.target.response, function (buffer) {
      self.buffer_ = buffer;
      loadCb();
    });
  }
}
