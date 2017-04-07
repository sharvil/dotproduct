import Range from 'math/Range';
import Vector from 'math/Vector';
import Bomb from 'model/projectile/Bomb';
import Bullet from 'model/projectile/Bullet';
import Exhaust from 'model/Exhaust';
import Player from 'model/player/Player';
import { PrizeType, ToggleState } from 'types';
import Keyboard from 'input/Keyboard';
import Key from 'input/Key';
import Listener from 'Listener';
import Game from 'ui/Game';
import Prize from 'model/Prize';
import Flag from 'model/Flag';
import Projectile from 'model/projectile/Projectile';

export default class LocalPlayer extends Player {
  private projectileFireDelay_ : Range;
  private shipChangeDelay_ : Range;
  private respawnTimer_ : number;
  private ticksSincePositionUpdate_ : number;
  private exhaust_ : Array<Exhaust>;
  private exhaustTimer_ : Range;
  private keyboard_ : Keyboard;

  constructor(game : Game, id : string, name : string, team : number, ship : number) {
    super(game, id, name, team, ship, 0 /* bounty */);

    this.projectileFireDelay_ = new Range(0, Number.MAX_VALUE, 1);
    this.shipChangeDelay_ = new Range(0, 300, 1);  // 3 seconds
    this.respawnTimer_ = 0;
    this.ticksSincePositionUpdate_ = 999999;
    this.exhaust_ = [];
    this.exhaustTimer_ = new Range(0, 6, 1);
    this.keyboard_ = game.getKeyboard();
    Listener.add(this.keyboard_, Key.Map.TOGGLE_MULTIFIRE, this.onToggleMultifire_.bind(this));
  }

  protected shouldCollectPrize_(prize : Prize) : boolean { return true; }

  public onPrizeCollected(prize : Prize | null) {
    super.onPrizeCollected(prize);

    if (!prize) {
      return;
    }

    switch (prize.getType()) {
      case PrizeType.NONE:
        break;
      case PrizeType.GUN_UPGRADE:
        this.gun_.upgrade();
        break;
      case PrizeType.BOMB_UPGRADE:
        this.bombBay_.upgrade();
        break;
      case PrizeType.FULL_ENERGY:
        this.energy_ = this.maxEnergy_;
        break;
      case PrizeType.BOUNCING_BULLETS:
        this.gun_.setBounces(true);
        break;
      case PrizeType.MULTIFIRE:
        this.gun_.grantMultifire();
        break;
      default:
        assert(false, 'Unhandled prize type: ' + prize.getType());
    }
  }

  protected captureFlag_(flag : Flag) {
    super.captureFlag_(flag);

    if (flag.captureFlag(this.getTeam())) {
      this.game_.getProtocol().sendFlagCaptured(flag.getId());
    }
  }

  /**
   * Called when the player takes damage from a projectile fired by some other player.
   *
   * @param {!model.player.Player} player The player whose projectile is causing the damage.
   * @param {!model.projectile.Projectile} projectile The projectile that caused the damage.
   * @param {number} damage The damage, in energy units, caused by the projectile.
   */
  public onDamage(shooter : Player, projectile : Projectile, energy : number) {
    if (!this.isAlive() || this.isSafe()) {
      return;
    }

    this.energy_ = Math.max(this.energy_ - energy, (shooter == this) ? 1 : 0);
    if (this.energy_ <= 0) {
      var bountyGained = this.bounty_;
      this.onDeath(shooter);
      shooter.onKill(this, bountyGained);
    }
  }

  public onDeath(killer : Player) {
    super.onDeath(killer);
    this.respawnTimer_ = this.shipSettings_['respawnDelay'];
  }

  public respawn() {
    this.angleInRadians_ = Math.random() * 2 * Math.PI;
    this.position_ = this.game_.getMap().getSpawnLocation(this);
    this.velocity_ = Vector.ZERO;
    this.energy_ = this.shipSettings_['maxEnergy'];
    this.maxEnergy_ = this.shipSettings_['maxEnergy'];

    // Notify listeners that we've respawned after updating internal state.
    super.respawn();
  }

  public setShip(ship : number) {
    super.setShip(ship);
    this.respawn();
  }

  public setPresence(presence : Player.Presence) {
    super.setPresence(presence);
    this.game_.getProtocol().sendSetPresence(this.presence_);
  }

  public clearPresence(presence : Player.Presence) {
    super.clearPresence(presence);
    this.game_.getProtocol().sendSetPresence(this.presence_);
  }

  public advanceTime() {
    var forceSendUpdate = false;
    var isSafe = this.isSafe();

    --this.respawnTimer_;
    if (this.respawnTimer_ > 0) {
      return;
    } else if (this.respawnTimer_ == 0) {
      this.setShip(this.ship_);
      forceSendUpdate = true;
    }

    ++this.ticksSincePositionUpdate_;
    this.shipChangeDelay_.decrement();
    this.projectileFireDelay_.decrement();
    this.exhaustTimer_.decrement();
    this.energy_ = isSafe ? this.maxEnergy_ : Math.min(this.energy_ + this.shipSettings_['rechargeRate'], this.maxEnergy_);
    this.exhaust_ = this.exhaust_.filter(function (e) { return e.isValid(); });

    // Check for ship change before we read any ship settings.
    if (this.shipChangeDelay_.isLow()) {
      for (var i = 0; i < this.settings_['ships'].length; ++i) {
        var keycode = (49 + i);  // Digits 1-n
        if (this.keyboard_.isKeyPressed(keycode)) {
          if (i != this.ship_) {
            if (this.energy_ >= this.maxEnergy_) {
              this.setShip(i);
              forceSendUpdate = true;
            } else {
              // TODO(sharvil): we shouldn't reach into game's private member...
              this.game_.getNotifications().addMessage('You must have full energy to change ships.');
            }
            this.shipChangeDelay_.setHigh();
          }
          break;
        }
      }
    }

    var oldAngle = this.angleInRadians_;
    var oldVelocity = this.velocity_;

    var shipRotation = this.shipSettings_['rotationRadiansPerTick'];
    if (this.keyboard_.isKeyPressed(Key.Map.ROTATE_RIGHT)) {
      this.angleInRadians_ += shipRotation;
    } else if (this.keyboard_.isKeyPressed(Key.Map.ROTATE_LEFT)) {
      this.angleInRadians_ -= shipRotation;
    }

    if (this.angleInRadians_ < 0 || this.angleInRadians_ >= Math.PI * 2) {
      this.angleInRadians_ -= Math.floor(this.angleInRadians_ / (2 * Math.PI)) * 2 * Math.PI;
    }

    var angle = this.getAngle_();
    var maximumSpeed = this.shipSettings_['speedPixelsPerTick'];
    var acceleration = this.shipSettings_['accelerationPerTick'];
    var accelerationEnergy = 0;
    if (this.keyboard_.isKeyPressed(Key.Map.AFTERBURNER) && this.energy_ > this.shipSettings_['afterburnerEnergy']) {
      maximumSpeed = this.shipSettings_['afterburnerMaxSpeed'];
      acceleration = this.shipSettings_['afterburnerAcceleration'];
      accelerationEnergy = this.shipSettings_['afterburnerEnergy'];
    }

    if (this.keyboard_.isKeyPressed(Key.Map.REVERSE_THRUST)) {
      this.applyThrust_(Vector.fromPolar(acceleration, angle).scale(-1));
      this.energy_ -= accelerationEnergy;
    } else if (this.keyboard_.isKeyPressed(Key.Map.FORWARD_THRUST)) {
      this.applyThrust_(Vector.fromPolar(acceleration, angle));
      this.energy_ -= accelerationEnergy;
    }

    // Magnitude of speed is greater than maximum ship speed - clamp.
    var magnitude = this.velocity_.magnitude();
    if (magnitude > maximumSpeed) {
      this.velocity_ = this.velocity_.resize(maximumSpeed);
    }

    this.updatePosition_(this.shipSettings_['bounceFactor']);

    var weaponData = this.getFiredWeapon_();

    // If, after the position update, we moved into / out of a safe zone, send a force update.
    if (this.isSafe() != isSafe) {
      // This convoluted bit of logic says that if we transitioned from !safe -> safe, we should
      // remove all projectiles.
      if (!isSafe) {
        this.clearProjectiles_();
      }
      forceSendUpdate = true;
    }
    this.sendPositionUpdate_(forceSendUpdate, this.velocity_ != oldVelocity || this.angleInRadians_ != oldAngle, weaponData);
  }

  /**
   * Returns an object that contains all the data for a weapon that needs to get
   * serialized over the network. If this function returns null, the player didn't
   * fire any weapon.
   */
  private getFiredWeapon_() : any | null {
    if (!this.projectileFireDelay_.isLow()) {
      return null;
    }

    var self = this;

    if (this.keyboard_.isKeyPressed(Key.Map.FIRE_GUN)) {
      if (this.isSafe()) {
        this.velocity_ = Vector.ZERO;
        return null;
      }
      var angle = this.getAngle_();
      var position = this.position_;
      var velocity = this.velocity_;

      return this.gun_.fire(angle, position, velocity, function (fireEnergy, fireDelay) {
        if (self.energy_ > fireEnergy) {
          self.energy_ -= fireEnergy;
          self.projectileFireDelay_.setValue(fireDelay);
          return true;
        }
        return false;
      });
    }

    if (this.keyboard_.isKeyPressed(Key.Map.FIRE_BOMB) || this.keyboard_.isKeyPressed(Key.Map.FIRE_MINE)) {
      if (this.isSafe()) {
        this.velocity_ = Vector.ZERO;
        return null;
      }
      var angle = this.getAngle_();
      var position = this.position_;
      var velocity = this.velocity_;
      var isMine = this.keyboard_.isKeyPressed(Key.Map.FIRE_MINE);

      return this.bombBay_.fire(angle, position, velocity, isMine, function (fireEnergy, fireDelay, recoil) {
        if (self.energy_ > fireEnergy) {
          self.energy_ -= fireEnergy;
          self.projectileFireDelay_.setValue(fireDelay);
          self.velocity_ = self.velocity_.subtract(Vector.fromPolar(recoil, angle));
          return true;
        }
        return false;
      });
    }

    if (this.keyboard_.isKeyPressed(Key.Map.FIRE_BURST)) {
      if (this.isSafe()) {
        this.velocity_ = Vector.ZERO;
        return null;
      }
      return this.burst_.fire(this.position_, function (fireEnergy, fireDelay) {
        self.projectileFireDelay_.setValue(fireDelay);
        return true;
      });
    }

    if (this.keyboard_.isKeyPressed(Key.Map.FIRE_DECOY)) {
      if (this.isSafe()) {
        this.velocity_ = Vector.ZERO;
        return null;
      }
      return this.decoy_.fire(this.position_, function (fireEnergy, fireDelay) {
        self.projectileFireDelay_.setValue(fireDelay);
        return true;
      });
    }

    if (this.keyboard_.isKeyPressed(Key.Map.FIRE_REPEL)) {
      if (this.isSafe()) {
        this.velocity_ = Vector.ZERO;
        return null;
      }
      return this.repel_.fire(this.position_, function (fireEnergy, fireDelay) {
        self.projectileFireDelay_.setValue(fireDelay);
        return true;
      });
    }
  }

  private applyThrust_(thrustVector : Vector) {
    this.velocity_ = this.velocity_.add(thrustVector);

    if (!this.exhaustTimer_.isLow()) {
      return;
    }

    var angle = this.getAngle_();
    var bottomOfShip = this.position_.subtract(Vector.fromPolar(this.radius_, angle));
    var exhaustVelocity = this.velocity_.subtract(thrustVector.resize(5));
    var perpendicular = Vector.fromPolar(1, angle + Math.PI / 2);

    var e1 = new Exhaust(this.game_, bottomOfShip.add(perpendicular.scale(3)), exhaustVelocity.add(perpendicular));
    var e2 = new Exhaust(this.game_, bottomOfShip.subtract(perpendicular.scale(3)), exhaustVelocity.subtract(perpendicular));
    this.exhaust_.push(e1);
    this.exhaust_.push(e2);
    this.exhaustTimer_.setHigh();
  }

  private sendPositionUpdate_(forceSendUpdate : boolean, isAccelerating : boolean, weaponData? : any) {
    if (!forceSendUpdate) {
      var sendPositionDelay = this.settings_['network']['sendPositionDelay'];
      if (isAccelerating) {
        sendPositionDelay = this.settings_['network']['fastSendPositionDelay'];
      }

      if (!weaponData && this.ticksSincePositionUpdate_ < sendPositionDelay) {
        return;
      }
    }

    this.game_.getProtocol().sendPosition(this.angleInRadians_, this.position_, this.velocity_, this.isSafe(), weaponData);
    this.ticksSincePositionUpdate_ = 0;
  }

  /**  Returns the angle, in radians, of the ship's current direction. */
  private getAngle_() : number {
    return 2 * Math.PI * this.getDirection() / Player.DIRECTION_STEPS;
  }

  private onToggleMultifire_() {
    this.gun_.toggleMultifire();

    var state = this.gun_.getMultifireState();
    if (state != ToggleState.UNAVAILABLE) {
      Listener.fire(this, 'multifire', state == ToggleState.ENABLED)
    }
  }

  public isSafe() : boolean {
    var map = this.game_.getMap();
    var pos = map.toTileCoordinates(this.position_);
    var tile = map.getTile(pos.x, pos.y);
    var tileProperties = map.getTileProperties(tile);
    return !!tileProperties['safe'];
  }

  /**
   * Returns the amount of time left for the local player to respawn.
   * 0 if the player is alive, >0 if the player is dead.
   */
  public getRespawnTimer = function () {
    return this.respawnTimer_;
  }

  /**
   * TODO: split exhaust into the standard model/view classes and don't expose
   * the array from here.
   */
  public getExhaust = function () {
    return this.exhaust_;
  }

  public get gunLevel() : number {
    return this.gun_.getLevel();
  }

  public get bombLevel() : number {
    return this.bombBay_.getLevel();
  }

  public get burstCount() : number {
    return this.burst_.getCount();
  }

  public get decoyCount() : number {
    return this.decoy_.getCount();
  }
}
