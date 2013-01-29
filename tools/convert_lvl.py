#!/usr/bin/python

import argparse
import json
import os
import struct
import sys


TILE_PROPERTIES = [
  { 'index': -1,  'object': 0, 'animated': False, 'safe': False, 'collision': False },
  { 'index': 170, 'object': 0, 'animated': False, 'safe': True,  'collision': False },
  { 'index': 0,   'object': 1, 'animated': True,  'safe': False, 'collision': True  }
]


TILE_MAPPING = {
  0: 0,
  171: 1
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
