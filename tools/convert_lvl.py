#!/usr/bin/python

import argparse
import json
import os
import struct
import sys


# Enumeration defining the possible object types supported
# in dotproduct.
OBJECT_NONE  = 0
OBJECT_PRIZE = 1
OBJECT_FLAG  = 2


# index: index in tileset to render with if animated==False, or the anim<index> resource to use if animated==True
# object: the type of map object this tile represents
# animated: False if the tile comes from the tileset, True if it comes from an anim<index> resource
# safe: True if players don't take damage while on that tile, False otherwise
# collision: True if players and weapons collide with the tile, False otherwise
TILE_PROPERTIES = [
  { 'index': -1,  'object': OBJECT_NONE,  'animated': False, 'safe': False, 'collision': False },  #  0: No tile
  { 'index': -1,  'object': OBJECT_NONE,  'animated': False, 'safe': False, 'collision': True  },  #  1: Collision helper
  { 'index': 170, 'object': OBJECT_NONE,  'animated': False, 'safe': True,  'collision': False },  #  2: Safe
  { 'index': 0,   'object': OBJECT_PRIZE, 'animated': True,  'safe': False, 'collision': True  },  #  3: Prize
  { 'index': 1,   'object': OBJECT_NONE,  'animated': True,  'safe': False, 'collision': True  },  #  4: Rock 1
  { 'index': 2,   'object': OBJECT_NONE,  'animated': True,  'safe': False, 'collision': True  },  #  5: Rock 2
  { 'index': 3,   'object': OBJECT_NONE,  'animated': True,  'safe': False, 'collision': True  },  #  6: Rock 3
  { 'index': 4,   'object': OBJECT_FLAG,  'animated': True,  'safe': False, 'collision': True  },  #  7: Friend flag
  { 'index': 5,   'object': OBJECT_FLAG,  'animated': True,  'safe': False, 'collision': True  }   #  8: Foe flag
]


# Mapping from SubSpace tile numbers to dotproduct tile numbers.
TILE_MAPPING = {
  0: 0,
  171: 2,   # Safe
  216: 4,   # Rock 1
  217: 5,   # Rock 2
  218: 6,   # Rock 3
  170: 7    # Flag
}


def writeToFile(f, s):
  if s != None:
    fp = open(f, 'w')
    fp.write(s)
    fp.close()


# Given a SubSpace tile, returns one for dotproduct.
def mapProperties(tile):
  if tile not in TILE_MAPPING:
    properties = { 'object': 0, 'safe': 0 }
    properties['index'] = tile - 1
    properties['collision'] = tile < 172
    TILE_MAPPING[tile] = len(TILE_PROPERTIES)
    TILE_PROPERTIES.append(properties)
  return TILE_MAPPING[tile]


def toJson(levelFp, outputDir):
  levelObj = {}
  bitmap = None
  if levelFp.read(1) == 'B' and levelFp.read(1) == 'M':
    bitmapSize, = struct.unpack('<I', levelFp.read(4))
    levelFp.seek(0)
    bitmap = levelFp.read(bitmapSize)
  else:
    levelFp.seek(0)

  # Read records from level and add to dictionary
  while True:
    record = levelFp.read(4)
    if record == '':
      break
    record, = struct.unpack('<I', record)
    x = record & 0x3FF
    y = (record >> 12) & 0x3FF
    tile = (record >> 24) & 0xFF
    levelObj[x + y * 1024] = mapProperties(tile)
    if tile == 217:
      levelObj[(x + 1) + y * 1024] = 1
      levelObj[x + (y + 1) * 1024] = 1
      levelObj[(x + 1) + (y + 1) * 1024] = 1

  # Draw border around entire map
  for i in range(0, 1024):
    levelObj[i] = mapProperties(20)
    levelObj[i + 1023 * 1024] = mapProperties(20)
    levelObj[i * 1024] = mapProperties(20)
    levelObj[1023 + i * 1024] = mapProperties(20)

  writeToFile(os.path.join(outputDir, 'tile_properties.json'), json.dumps(TILE_PROPERTIES))
  writeToFile(os.path.join(outputDir, 'tileset.bmp'), bitmap)
  writeToFile(os.path.join(outputDir, 'map.json'), json.dumps(levelObj))


def main():
  parser = argparse.ArgumentParser(description = 'Converts a SubSpace LVL file to dotproduct level files.')
  parser.add_argument('-o', '--out', nargs=1, default='.')
  parser.add_argument('lvlFile', type=argparse.FileType('rb'))
  args = parser.parse_args()
  toJson(args.lvlFile, args.out[0])


if __name__ == '__main__':
  main()
