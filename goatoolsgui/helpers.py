import os

import json
import collections



def ensure_path_exists(path):
  if not os.path.exists(path):
    try:
      os.makedirs(path)
    except:
      print "\nCouldn't make directory\n"
    return

def json_obj_to_dict(obj):
  decoder = json.JSONDecoder(object_pairs_hook=collections.OrderedDict)
  decoded_obj = decoder.decode(obj)
  return decoded_obj
