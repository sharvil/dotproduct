import Listener from 'Listener';
import BombBay from 'model/BombBay';
import BurstWeapon from 'model/BurstWeapon';
import DecoyWeapon from 'model/DecoyWeapon';
import Entity from 'model/Entity';
import Gun from 'model/Gun';
import RepelWeapon from 'model/RepelWeapon';
import Weapon from 'model/Weapon';
import Vector from 'math/Vector';
import Projectile from 'model/projectile/Projectile';
import Game from 'ui/Game';
import Prize from 'model/Prize';
import Repel from 'model/projectile/Repel';

type PlayerEvent =
    'bounce' |
    'collect_prize' |
    'death' |
    'respawn' |
    'shipchange';

abstract class Player extends Entity {
  public static readonly SYSTEM_PLAYER_ID : string = '0';
  public static readonly DIRECTION_STEPS : number = 40;

  protected settings_ : any;
  protected shipSettings_ : any;
  protected gun_ : Gun;
  protected bombBay_ : BombBay;
  protected burst_ : BurstWeapon;
  protected decoy_ : DecoyWeapon;
  protected repel_ : RepelWeapon;
  protected id_ : string;
  protected name_ : string;
  protected team_ : number;
  protected angleInRadians_ : number;
  protected energy_ : number;
  protected maxEnergy_ : number;
  protected ship_ : number;
  protected bounty_ : number;
  private projectiles_ : Array<Projectile>;
  protected presence_ : Player.Presence;
  protected points_ : number;
  protected wins_ : number;
  protected losses_ : number;

  constructor(game : Game, id : string, name : string, team : number, ship : number, bounty : number) {
    super(game);

    this.settings_ = game.getSettings();this.shipSettings_ = this.settings_['ships'][ship];
    this.gun_ = new Gun(game, this.shipSettings_['bullet'], this);
    this.bombBay_ = new BombBay(game, this.shipSettings_['bomb'], this);
    this.burst_ = new BurstWeapon(game, this.shipSettings_['burst'], this);
    this.decoy_ = new DecoyWeapon(game, this.shipSettings_['decoy'], this);
    this.repel_ = new RepelWeapon(game, this.shipSettings_['repel'], this);
    this.id_ = id;
    this.name_ = name;
    this.team_ = team;
    this.angleInRadians_ = 0;
    this.energy_ = 0;
    this.maxEnergy_ = 0;
    this.projectiles_ = [];
    this.presence_ = Player.Presence.DEFAULT;
    this.points_ = 0;
    this.wins_ = 0;
    this.losses_ = 0;

    this.setShip(ship);
    this.bounty_ = bounty;
  }

  public getId() : string {
    return this.id_;
  }

  public getName() : string {
    return this.name_;
  }

  public getEnergy() : number {
    return Math.floor(this.energy_);
  }

  public getMaxEnergy() : number {
    return this.maxEnergy_;
  }

  public getShip() : number {
    return this.ship_;
  }

  public getTeam() : number {
    return this.team_;
  }

  public getPoints() : number {
    return this.points_;
  }

  public getBounty() : number {
    return this.bounty_;
  }

  /**
   * Returns an integer that represents the direction the player is facing. The
   * direction is distinct from the angle: an angle is represented in radians
   * whereas the direction is an integer in the range [0, DIRECTION_STEPS).
   */
  public getDirection() : number {
    return Math.floor(this.angleInRadians_ / (2 * Math.PI) * Player.DIRECTION_STEPS);
  }

  public isAlive() : boolean {
    return this.energy_ > 0;
  }

  /** Returns true if this player is a friend of (on the same team as) the other player. */
  public isFriend(other : Player) : boolean {
    return this.team_ == other.team_;
  }

  public setPresence(presence : Player.Presence) {
    this.presence_ |= presence;
  }

  public clearPresence(presence : Player.Presence) {
    this.presence_ &= ~presence;
  }

  public hasPresence(presence : Player.Presence) : boolean {
    return (this.presence_ & presence) != 0;
  }

  public setShip(ship : number) {
    let oldShip = this.ship_;

    this.ship_ = ship;
    this.shipSettings_ = this.settings_['ships'][this.ship_];
    this.gun_ = new Gun(this.game_, this.shipSettings_['bullet'], this);
    this.bombBay_ = new BombBay(this.game_, this.shipSettings_['bomb'], this);
    this.burst_ = new BurstWeapon(this.game_, this.shipSettings_['burst'], this);
    this.decoy_ = new DecoyWeapon(this.game_, this.shipSettings_['decoy'], this);
    this.repel_ = new RepelWeapon(this.game_, this.shipSettings_['repel'], this);

    this.position_ = Vector.ZERO;
    this.velocity_ = Vector.ZERO;
    this.energy_ = 0;
    this.bounty_ = 0;
    this.radius_ = this.shipSettings_['radius'];
    this.clearProjectiles_();

    // If we changed ship type, fire an event. Otherwise, we're simply resetting
    // the ship state so we don't need to fire a ship change event.
    if (this.ship_ != oldShip) {
      Listener.fire(this, 'shipchange', ship);
    }
  }

  public onWeaponFired(timeDiff : number, position : Vector, velocity : Vector, weaponData : any) {
    switch (weaponData['type']) {
      case this.gun_.getType():
        this.gun_.onFired(timeDiff, position, velocity, weaponData);
        break;
      case this.bombBay_.getType():
        this.bombBay_.onFired(timeDiff, position, velocity, weaponData);
        break;
      case this.burst_.getType():
        this.burst_.onFired(timeDiff, position, velocity, weaponData);
        break;
      case this.decoy_.getType():
        this.decoy_.onFired(timeDiff, position, velocity, weaponData);
        break;
      case this.repel_.getType():
        this.repel_.onFired(timeDiff, position, velocity, weaponData);
        break;
      default:
        break;
    }
  }

  public respawn() {
    Listener.fire(this, 'respawn');
  }

  /**
   * Called when the player takes damage from a projectile fired by some other player.
   * @param {Player} player The player whose projectile is causing the damage.
   * @param {Projectile} projectile The projectile that caused the damage.
   * @param {number} damage The damage, in energy units, caused by the projectile.
  */
  public onDamage(player : Player, projectile : Projectile, damage : number) {}

  /** Called when this player is killed by someone. */
  public onDeath(killer : Player) {
    ++this.losses_;
    this.bounty_ = 0;
    this.energy_ = 0;
    Listener.fire(this, 'death', killer);
  }

  /**
   * Called when this player kills someone.
   * @param {!model.player.Player} killee The player who we just killed.
   * @param {number} extraPoints How many points were gained by killing this player.
   */
  public onKill(killee : Player, extraPoints : number) {
    this.points_ += this.settings_['game']['killPoints'] + extraPoints;
    ++this.wins_;
  }

  /** Called when this player's score gets updated from the server. */
  public onScoreUpdate(points : number, wins : number, losses : number) {
    this.points_ = points;
    this.wins_ = wins;
    this.losses_ = losses;
  }

  public onPrizeCollected(prize : Prize | null) {
    ++this.bounty_;
    Listener.fire(this, 'collect_prize', prize);
  }

  /** 
   * This function is called when a repel is active and may affect the player and
   * their projectiles.
   */
  public onRepelled(repel : Repel) {
    this.velocity_ = repel.apply(this.position_, this.velocity_);

    for (let i = 0; i < this.projectiles_.length; ++i) {
      this.projectiles_[i].onRepelled(repel);
    }
  }

  public addProjectile(projectile : Projectile) {
    this.projectiles_ = this.projectiles_.filter(function (p) { return p.isValid(); });
    this.projectiles_.push(projectile);
  }

  protected clearProjectiles_() {
    this.projectiles_.forEach(function (projectile) {
      if (projectile.isValid()) {
        projectile.invalidate();
      }
    });
    this.projectiles_ = [];
  }

  protected onInvalidate_() {
    super.onInvalidate_();
    this.clearProjectiles_();
  }

  protected bounce_() {
    Listener.fire(this, 'bounce');
  }
}

namespace Player {
  export const enum Presence {
    DEFAULT = 0,
    TYPING = 1,
    AWAY = 2,
    ALL = 0x7FFFFFFF
  }
}

export default Player;
