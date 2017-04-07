import Vector from 'math/Vector';

interface Weapon {
  getType() : Weapon.Type;
  onFired(timeDiff : number, position : Vector, velocity : Vector, weaponData : any);
}

namespace Weapon {
  export enum Type {
    GUN = 1,
    BOMB = 2,
    BURST = 3,
    DECOY = 4,
    REPEL = 5
  }
}

export default Weapon;
