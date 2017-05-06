import Prng from 'math/Prng';
import Prize from 'model/Prize';
import { PrizeType } from 'types';
import Simulation from 'model/Simulation';
import Map from 'model/Map';
import Vector from 'math/Vector';
import ModelObject from 'model/ModelObject';

export default class PrizeList extends ModelObject {
  private prizeSettings_ : any;
  private map_ : Map;
  private prng_ : Prng;
  private killPrng_ : Prng;
  private prizes_ : Array<Prize>;

  constructor(simulation : Simulation, settings : Object, map : Map) {
    super(simulation);
    this.prizeSettings_ = settings['prize'];
    this.map_ = map;
    this.prng_ = new Prng();

    // This PRNG doesn't need to be synchronized across clients. We use
    // it to generate kill prize types and to avoid getting this.prng_
    // out of sync.
    this.killPrng_ = new Prng();
    this.prizes_ = [];
  }

  public addKillPrize(x : number, y : number) {
    let coordinates = this.map_.toTileCoordinates(new Vector(x, y));
    let xTile = coordinates.x;
    let yTile = coordinates.y;

    if (this.map_.getTile(xTile, yTile) == 0) {
      let type = this.generatePrizeType_(this.killPrng_);
      let ttl = this.generateTimeToLive_(this.killPrng_);
      let prize = new Prize(this.simulation_, this.map_, type, xTile, yTile, ttl);
      this.prizes_.push(prize);
    }
  }

  public onSeedUpdate(seed : number, fastForwardTicks : number) {
    // Set the seed.
    this.prng_.seed(seed);
    this.killPrng_.seed(this.killPrng_.random() ^ seed);

    // Create prizes using new seed.
    let prizeRadius = this.prizeSettings_['radius'];
    for (let i = 0; i < this.prizeSettings_['count']; ++i) {
      let type = this.generatePrizeType_(this.prng_);
      let ttl = this.generateTimeToLive_(this.prng_);

      // Generate random coordinates in the range [-prizeRadius, prizeRadius) and offset by the center of the map.
      let xTile = Math.floor(this.map_.getWidth() / 2 + this.prng_.random() % prizeRadius * 2 - prizeRadius);
      let yTile = Math.floor(this.map_.getHeight() / 2 + this.prng_.random() % prizeRadius * 2 - prizeRadius);

      if (this.map_.getTile(xTile, yTile) == 0) {
        let prize = new Prize(this.simulation_, this.map_, type, xTile, yTile, ttl);
        this.prizes_.push(prize);
      }
    }

    this.advanceTime(fastForwardTicks);
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

  public advanceTime(fastForwardTicks? : number) {
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

  protected onInvalidate_() : void {
    assert(false, 'Cannot invalidate PrizeList');
  }

  private generatePrizeType_(prng : Prng) : PrizeType {
    let prizeWeights = this.prizeSettings_['weights'];

    let sum = 0;
    for (let i = 0; i < prizeWeights.length; ++i) {
      sum += prizeWeights[i];
    }

    assert(sum > 0, 'Prize weights must be greater than 0.');

    let type;
    let variate = prng.random() % sum;
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
