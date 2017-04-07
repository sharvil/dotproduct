import Rect from 'math/Rect';

const MIN_SIZE_ : number =  4;
const MIN_TILES_ : number = 16;

class Quadtree {
  private rootNode_ : Quadtree.Node;
  constructor(mapData : Map<number, number>, width : number, height : number) {
    this.rootNode_ = new Quadtree.Node(mapData, width, new Rect(0, 0, width, height));
  }

  public tilesForViewport(viewport : Rect) : Array<any> {
    return this.rootNode_.tilesForViewport(viewport);
  }
}

namespace Quadtree {
  export class Node {
    private rect_ : Rect;
    private children_ : Array<Node>;
    private tiles_ : Array<any>;
    private count_ : number;

    constructor(mapData : Map<number, number>, stride : number, rect : Rect) {
      this.rect_ = rect;
      this.children_ = [];
      this.tiles_ = [];
      this.count_ = 0;

      var width = rect.width;
      var height = rect.height;
      if (width > MIN_SIZE_ && height > MIN_SIZE_) {
        var midX = rect.left + Math.floor(width / 2);
        var midY = rect.top + Math.floor(height / 2);
        this.children_.push(new Node(mapData, stride, Rect.fromBox(rect.left, rect.top, midX, midY)));
        this.children_.push(new Node(mapData, stride, Rect.fromBox(midX + 1, rect.top, rect.right, midY)));
        this.children_.push(new Node(mapData, stride, Rect.fromBox(rect.left, midY + 1, midX, rect.bottom)));
        this.children_.push(new Node(mapData, stride, Rect.fromBox(midX + 1, midY + 1, rect.right, rect.bottom)));
        this.merge_();
        this.prune_();
      } else {
        for (var y = rect.top; y <= rect.bottom; ++y) {
          for (var x = rect.left; x <= rect.right; ++x) {
            var tileValue = mapData[y * stride + x];
            if (tileValue) {
              this.tiles_.push({ x: x, y: y, tileValue: tileValue });
            }
          }
        }
        this.count_ = this.tiles_.length;
      }
    }

    public tilesForViewport(viewport : Rect) : Array<any> {
      var ret : Array<any> = [];
      if (!this.overlaps_(viewport)) {
        return ret;
      }

      ret = ret.concat(this.tiles_);
      for (var i = 0; i < this.children_.length; ++i) {
        ret = ret.concat(this.children_[i].tilesForViewport(viewport));
      }
      return ret;
    }

    private merge_() {
      for (var i = 0; i < this.children_.length; ++i) {
        this.count_ += this.children_[i].count_;
      }

      if (this.count_ <= MIN_TILES_) {
        for (var i = 0; i < this.children_.length; ++i) {
          this.tiles_ = this.tiles_.concat(this.children_[i].tiles_);
        }
        this.children_ = [];
      }
    }

    private prune_() {
      var prunedChildren : Array<Node> = [];
      for (var i = 0; i < this.children_.length; ++i) {
        var child = this.children_[i];
        if (child.count_) {
          prunedChildren.push(child);
        }
      }

      this.children_ = prunedChildren;
    }

    private overlaps_(viewport : Rect) : boolean {
      return !(this.rect_.right < viewport.left || this.rect_.bottom < viewport.top || this.rect_.left > viewport.right || this.rect_.top > viewport.bottom);
    }
  }
}

export default Quadtree;
