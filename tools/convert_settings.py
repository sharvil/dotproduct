#!/usr/bin/python

import argparse
import json
import math
import os
import struct
import sys

def parseConfig(settingsFile):
  settings = {}
  curSection = None
  lines = [x.strip() for x in settingsFile.readlines()]
  for line in lines:
    if line.startswith('['):
      curSection = line[1:-1]
      settings[curSection] = {}
    elif line.find('=') != -1:
      key, value = line.split('=')
      settings[curSection][key] = value
  return settings

def convertShip(name, settings):
  radius = int(settings[name]['Radius'])
  if radius == 0:
    radius = 14

  jsonSettings = {}
  jsonSettings['name'] = name
  jsonSettings['xRadius'] = radius
  jsonSettings['yRadius'] = radius
  jsonSettings['bounceFactor'] = 16.0 / int(settings['Misc']['BounceFactor'])
  jsonSettings['rotationRadiansPerTick'] = 2 * math.pi * int(settings[name]['InitialRotation']) / 40000.0
  jsonSettings['speedPixelsPerTick'] = int(settings[name]['InitialSpeed']) / 1000.0
  jsonSettings['maxEnergy'] = int(settings[name]['InitialEnergy'])
  jsonSettings['accelerationPerTick'] = int(settings[name]['InitialThrust']) / 1000.0
  jsonSettings['afterburnerMaxSpeed'] = jsonSettings['speedPixelsPerTick'] * 2
  jsonSettings['afterburnerAcceleration'] = 0.02
  jsonSettings['afterburnerEnergy'] = int(settings[name]['AfterburnerEnergy']) / 1000.0
  jsonSettings['rechargeRate'] = int(settings[name]['InitialRecharge']) / 1000.0
  jsonSettings['respawnDelay'] = 500

  bullet = {}
  bullet['fireEnergy'] = int(settings[name]['BulletFireEnergy'])
  bullet['speed'] = int(settings[name]['BulletSpeed']) / 1000.0
  bullet['fireDelay'] = int(settings[name]['BulletFireDelay'])
  bullet['lifetime'] = int(settings['Bullet']['BulletAliveTime'])
  bullet['damage'] = int(settings['Bullet']['BulletDamageLevel'])
  bullet['damageUpgrade'] = int(settings['Bullet']['BulletDamageUpgrade'])
  bullet['initialLevel'] = int(settings[name]['InitialGuns']) - 1
  bullet['maxLevel'] = int(settings[name]['MaxGuns']) - 1
  bullet['bounces'] = False

  bomb = {}
  bomb['fireEnergy'] = int(settings[name]['BombFireEnergy'])
  bomb['fireEnergyUpgrade'] = int(settings[name]['BombFireEnergyUpgrade'])
  bomb['speed'] = int(settings[name]['BombSpeed']) / 1000.0
  bomb['fireDelay'] = int(settings[name]['BombFireDelay'])
  bomb['lifetime'] = int(settings['Bomb']['BombAliveTime'])
  bomb['damage'] = int(settings['Bomb']['BombDamageLevel'])
  bomb['damageUpgrade'] = int(settings['Bomb']['BombDamageLevel'])
  bomb['initialLevel'] = int(settings[name]['InitialBombs']) - 1
  bomb['maxLevel'] = int(settings[name]['MaxBombs']) - 1
  bomb['blastRadius'] = int(settings['Bomb']['BombExplodePixels'])
  bomb['blastRadiusUpgrade'] = int(settings['Bomb']['BombExplodePixels'])
  bomb['proxRadius'] = int(settings['Bomb']['ProximityDistance'])
  bomb['proxRadiusUpgrade'] = int(settings['Bomb']['ProximityDistance'])
  bomb['bounceCount'] = int(settings[name]['BombBounceCount'])
  bomb['recoilAcceleration'] = int(settings[name]['BombThrust']) / 1000.0

  jsonSettings['bullet'] = bullet
  jsonSettings['bomb'] = bomb

  return jsonSettings

def convertToJson(settings):
  jsonSettings = {}
  jsonSettings['game'] = {
    'killPoints': 20,
    'maxTeams': 2
  }
  jsonSettings['network'] = {
    'sendPositionDelay': int(settings['Misc']['SendPositionDelay']),
    'fastSendPositionDelay': max(1, int(settings['Misc']['SendPositionDelay']) / 4)
  }
  jsonSettings['map'] = {
    'width': 1024,
    'height': 1024,
    'spawnRadius': 500
  }
  jsonSettings['prize'] = {
    'decayTime': 18000,
    'count': 50,
    'radius': 128,
    'weights': [1, 0, 0, 0, 0]
  }
  jsonSettings['ships'] = [
    convertShip('Warbird', settings),
    convertShip('Javelin', settings),
    convertShip('Spider', settings),
    convertShip('Leviathan', settings),
    convertShip('Terrier', settings),
    convertShip('Weasel', settings),
    convertShip('Lancaster', settings),
    convertShip('Shark', settings)
  ]
  return jsonSettings

def main():
  parser = argparse.ArgumentParser(description = 'Converts a SubSpace server.cfg file to a dotproduct settings file.')
  parser.add_argument('settingsFile', type=argparse.FileType('rb'))
  args = parser.parse_args()

  settings = parseConfig(args.settingsFile)
  jsonSettings = convertToJson(settings)
  print json.dumps(jsonSettings, indent = 2)

if __name__ == '__main__':
  main()
