import Prng from 'math/Prng';
import Prize from 'model/Prize';
import { PrizeType } from 'types';
import Simulation from 'model/Simulation';
import Map from 'model/Map';
import Game from 'ui/Game';
import Vector from 'math/Vector';

export default class PrizeIndex {
  private simulation_ : Simulation;
  private prizeSettings_ : any;
  private map_ : Map;
  private prng_ : Prng;
  private killPrng_ : Prng;
  private prizes_ : Array<Prize>;

  constructor(game : Game) {
    this.simulation_ = game.getSimulation();
    this.prizeSettings_ = game.getSettings()['prize'];
    this.map_ = game.getMap();
    this.prng_ = new Prng();

    // This PRNG doesn't need to be synchronized across clients. We use
    // it to generate kill prize types and to avoid getting this.prng_
    // out of sync.
    this.killPrng_ = new Prng();
    this.prizes_ = [];
  }

  public addKillPrize(x : number, y : number) {
    var coordinates = this.map_.toTileCoordinates(new Vector(x, y));
    var xTile = coordinates.x;
    var yTile = coordinates.y;

    if (this.map_.getTile(xTile, yTile) == 0) {
      var type = this.generatePrizeType_(this.killPrng_);
      var ttl = this.generateTimeToLive_(this.killPrng_);
      var prize = new Prize(this.simulation_, this.map_, type, xTile, yTile, ttl);
      this.prizes_.push(prize);
    }
  }

  public onSeedUpdate(seed : number, fastForwardTicks : number) {
    // Set the seed.
    this.prng_.seed(seed);
    this.killPrng_.seed(this.killPrng_.random() ^ seed);

    // Create prizes using new seed.
    var prizeRadius = this.prizeSettings_['radius'];
    for (var i = 0; i < this.prizeSettings_['count']; ++i) {
      var type = this.generatePrizeType_(this.prng_);
      var ttl = this.generateTimeToLive_(this.prng_);

      // Generate random coordinates in the range [-prizeRadius, prizeRadius) and offset by the center of the map.
      var xTile = Math.floor(this.map_.getWidth() / 2 + this.prng_.random() % prizeRadius * 2 - prizeRadius);
      var yTile = Math.floor(this.map_.getHeight() / 2 + this.prng_.random() % prizeRadius * 2 - prizeRadius);

      if (this.map_.getTile(xTile, yTile) == 0) {
        var prize = new Prize(this.simulation_, this.map_, type, xTile, yTile, ttl);
        this.prizes_.push(prize);
      }
    }

    this.advanceTime_(fastForwardTicks);
  }

  public getPrize(x : number, y : number) : Prize | null {
    return this.prizes_.find(function (prize) {
      return prize.isValid() && prize.getX() == x && prize.getY() == y;
    }) || null;
  }

  public removePrize(prize : Prize) {
    this.prizes_.remove(prize);
    prize.invalidate();
  }

  private advanceTime_(fastForwardTicks? : number) {
    this.forEach(function (prize) {
      prize.advanceTime(fastForwardTicks);
    });
  }

  public forEach(cb : (prize : Prize) => void) {
    this.prizes_ = this.prizes_.filter(function (prize) { return prize.isValid(); });
    this.prizes_.forEach(function (prize) {
      assert(!!prize, 'Null prize found in prize index.');
      cb(prize);
    });
  }

  private generatePrizeType_(prng : Prng) : PrizeType {
    var prizeWeights = this.prizeSettings_['weights'];

    var sum = 0;
    for (var i = 0; i < prizeWeights.length; ++i) {
      sum += prizeWeights[i];
    }

    assert(sum > 0, 'Prize weights must be greater than 0.');

    var type;
    var variate = prng.random() % sum;
    for (type = 0, sum = 0; type < prizeWeights.length; ++type) {
      sum += prizeWeights[type];
      if (sum > variate) {
        break;
      }
    }

    return <PrizeType> type;
  }

  private generateTimeToLive_(prng : Prng) : number {
    return prng.random() % this.prizeSettings_['decayTime'] + 1;
  }
}
