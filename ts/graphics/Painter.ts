import { Layer, NUM_LAYERS } from 'graphics/Layer';
import Viewport from 'Viewport';
import Drawable from 'graphics/Drawable';

export default class Painter {
  private layers_ : Array<Array<Drawable>>;

  constructor() {
    this.layers_ = [];
    for (let i = 0; i < NUM_LAYERS; ++i) {
      this.layers_.push([]);
    }
  }

  public registerDrawable(layer : Layer, drawable : Drawable) {
    assert(layer >= 0 && layer < NUM_LAYERS, 'Invalid layer id: ' + layer);
    this.layers_[layer].push(drawable);
  }

  public unregisterDrawable(layer : Layer, drawable : Drawable) {
    assert(layer >= 0 && layer < NUM_LAYERS, 'Invalid layer id: ' + layer);
    this.layers_[layer].remove(drawable);
  }

  public render(viewport : Viewport) {
    let context = viewport.getContext();
    context.save();
    context.fillStyle = '#000';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    for (let i = 0; i < this.layers_.length; ++i) {
      this.layers_[i].forEach(function (drawable) {
        drawable.render(viewport);
      });
    }
    context.restore();
  }
}
