import goog.object from 'goog.object';

import dotprod.math.Point from 'dotprod.math.Point';
import dotprod.structs.Heap from 'dotprod.structs.Heap';

/**
 * @constructor
 * @param {!dotprod.Game} game
 */
dotprod.ai.Pathfinder = function(game) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  this.map_ = game.getMap();

  this.nodes_ = {};
  this.components_ = [];

  let width = this.map_.getWidth();
  let height = this.map_.getHeight();
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      if (this.map_.getTile(x, y) == 0) {
        this.nodes_[this.key_(x, y)] = new dotprod.ai.Pathfinder.Node(x, y);
      }
    }
  }

  for (let i in this.nodes_) {
    let node = this.nodes_[i];
    if (!node.isVisited()) {
      this.components_.push(this.computeConnectedComponent_(node));
    }
  }

  console.log('Found ' + this.components_.length + ' components in map.');
  for (let i = 0; i < this.components_.length; ++i) {
    let len = goog.object.getCount(this.components_[i]);
    console.log('Component ' + i + ' has ' + len + ' tiles.');
  }
};

/**
 * @param {!dotprod.math.Vector} source
 * @param {!dotprod.math.Vector} destination
 * @return {!Array.<dotprod.math.Point>}
 */
dotprod.ai.Pathfinder.prototype.findPath = function(source, destination) {
  if (!this.pathExists(source, destination)) {
    return [];
  }

  dotprod.ai.Pathfinder.Node.reset();

  source = this.map_.toTileCoordinates(source);
  destination = this.map_.toTileCoordinates(destination);

  let sourceNode = this.nodes_[this.key_(source.getX(), source.getY())];
  sourceNode.cost = 0;
  sourceNode.estimate = this.heuristic_(sourceNode, destination);
  sourceNode.parentNode = null;

  let frontier = new dotprod.structs.Heap(function(e1, e2) { return e1.estimate - e2.estimate; });
  frontier.insert(sourceNode);
  while (!frontier.isEmpty()) {
    let node = frontier.pop();
    let x = node.x;
    let y = node.y;
    node.setVisited();

    if (x == destination.getX() && y == destination.getY()) {
      return this.computePath_(node);
    }

    let neighbours = this.getNeighbours_(node);
    for (let i = 0; i < neighbours.length; ++i) {
      let neighbour = neighbours[i];
      let stepCost = (neighbour.x == node.x || neighbour.y == node.y) ? 1 : Math.SQRT2;
      let cost = node.cost + stepCost + this.countNeighbouringWalls_(neighbour) * 0.75;

      if (neighbour.isDiscovered() && cost < neighbour.cost) {
        frontier.remove(neighbour);
        neighbour.reset();
      }

      if (!neighbour.isDiscovered()) {
        neighbour.cost = cost;
        neighbour.estimate = cost + this.heuristic_(neighbour, destination);
        neighbour.parentNode = node;
        neighbour.setDiscovered();
        frontier.insert(neighbour);
        // self.map_.setTile(node.x, node.y, 256 + node.cost);
      }
    }
  }

  return [];
};

dotprod.ai.Pathfinder.prototype.getNeighbours_ = function(node) {
  let neighbours = [];
  let indices = [-1, 0, 1];
  let width = this.map_.getWidth();
  let height = this.map_.getHeight();
  for (let i = 0; i < indices.length; ++i) {
    for (let j = 0; j < indices.length; ++j) {
      if (indices[i] == 0 && indices[j] == 0) {
        continue;
      }
      let x = node.x + indices[i];
      let y = node.y + indices[j];
      if (x < 0 || y < 0 || x >= width || y >= height || (this.map_.getTile(x, y) != 0 && this.map_.getTile(x, y) < 256)) {
        continue;
      }
      let neighbour = this.nodes_[this.key_(x, y)];
      if (!neighbour.isVisited()) {
        neighbours.push(neighbour);
      }
    }
  }
  return neighbours;
};

dotprod.ai.Pathfinder.prototype.countNeighbouringWalls_ = function(node) {
  let count = 0;
  let indices = [-1, 0, 1];
  for (let i = 0; i < indices.length; ++i) {
    for (let j = 0; j < indices.length; ++j) {
      if (indices[i] == 0 && indices[j] == 0) {
        continue;
      }
      let x = node.x + indices[i];
      let y = node.y + indices[j];
      if (this.map_.getTile(x, y) != 0 && this.map_.getTile(x, y) < 255) {
        ++count;
      }
    }
  }
  return count;
};

/**
 * @param {!dotprod.math.Vector} source
 * @param {!dotprod.math.Vector} destination
 * @return {boolean}
 */
dotprod.ai.Pathfinder.prototype.pathExists = function(source, destination) {
  source = this.map_.toTileCoordinates(source);
  destination = this.map_.toTileCoordinates(destination);

  let srcKey = this.key_(source.getX(), source.getY());
  let destKey = this.key_(destination.getX(), destination.getY());

  for (let i = 0; i < this.components_.length; ++i) {
    let foundSrc = !!this.components_[i][srcKey];
    let foundDest = !!this.components_[i][destKey];
    if (!foundSrc && !foundDest) {
      continue;
    }
    return foundSrc && foundDest;
  }

  return false;
};

dotprod.ai.Pathfinder.prototype.computeConnectedComponent_ = function(root) {
  let self = this;
  let width = this.map_.getWidth();
  let height = this.map_.getHeight();
  let addNode = function(x, y, frontier) {
    if (x < 0 || y < 0 || x >= width || y >= height || self.map_.getTile(x, y) != 0) {
      return;
    }
    let node = self.nodes_[self.key_(x, y)];
    if (!node.isDiscovered()) {
      node.setDiscovered();
      frontier.push(node);
    }
  };

  let component = {};
  let frontier = [root];
  while (frontier.length > 0) {
    let node = frontier.shift();
    let x = node.x;
    let y = node.y;
    component[this.key_(x, y)] = node;
    node.setVisited();

    addNode(x + 0, y - 1, frontier);
    addNode(x + 1, y - 1, frontier);
    addNode(x + 1, y + 0, frontier);
    addNode(x + 1, y + 1, frontier);
    addNode(x + 0, y + 1, frontier);
    addNode(x - 1, y + 1, frontier);
    addNode(x - 1, y + 0, frontier);
    addNode(x - 1, y - 1, frontier);
  }
  return component;
};

/**
 * @param {number} x
 * @param {number} y
 * @private
 */
dotprod.ai.Pathfinder.prototype.key_ = function(x, y) {
  return x + y * this.map_.getWidth();
};

dotprod.ai.Pathfinder.prototype.heuristic_ = function(node, destination) {
  let dx = Math.abs(node.x - destination.getX());
  let dy = Math.abs(node.y - destination.getY());

  return dx+dy;
  // return Math.sqrt(dx*dx + dy*dy);
};

dotprod.ai.Pathfinder.prototype.computePath_ = function(node) {
  let ret = [];
  while (node) {
    ret.push(new dotprod.math.Point(node.x, node.y));
    node = node.parentNode;
  }
  ret.reverse();
  return ret;
};

/**
 * @constructor
 */
dotprod.ai.Pathfinder.Node = function(x, y) {
  this.color_ = 0;
  this.generation_ = dotprod.ai.Pathfinder.Node.generation_;

  this.x = x;
  this.y = y;
  this.cost = 0;
  this.estimate = 0;
  this.parentNode;
};

dotprod.ai.Pathfinder.Node.reset = function() {
  ++dotprod.ai.Pathfinder.Node.generation_;
};

dotprod.ai.Pathfinder.Node.generation_ = 0;

dotprod.ai.Pathfinder.Node.prototype.isDiscovered = function() {
  return this.color_ >= 1 && this.generation_ == dotprod.ai.Pathfinder.Node.generation_;
};

dotprod.ai.Pathfinder.Node.prototype.setDiscovered = function() {
  this.generation_ = dotprod.ai.Pathfinder.Node.generation_;
  this.color_ = 1;
};

dotprod.ai.Pathfinder.Node.prototype.isVisited = function() {
  return this.color_ >= 2 && this.generation_ == dotprod.ai.Pathfinder.Node.generation_;
};

dotprod.ai.Pathfinder.Node.prototype.setVisited = function() {
  this.generation_ = dotprod.ai.Pathfinder.Node.generation_;
  this.color_ = 2;
};

dotprod.ai.Pathfinder.Node.prototype.reset = function() {
  this.generation_ = dotprod.ai.Pathfinder.Node.generation_;
  this.color_ = 0;
};
