# This is where calls to goatools_alpha are to be made

# TODO: Shouldn't be necessary in production
import sys
sys.path.append('/home/vagrant/goatools_alpha')
import os
# End comment

import goatools
from goatools_alpha import gosubdag_grouper as gta
from datetime import datetime
import json
import collections

# Here to speed development
os.chdir('/var/www/projects/gosite/data_files/')
# FLAT_GROUPS = gta.GrouperDflts()
FLAT_GROUPS = None
os.chdir('/var/www/projects/gosite/')
# /speed development


# TODO: Pass a boolean stating wheter a file download is wanted?
def submit_gos(form, form_file_path=None):
  goids = str(form.get('goids')).translate(None, ',').split()
  filename = str(form.get('filename'))

  """
  Any file that is passed will be a 'sections' file and must be passed to
  wr_xlsx_gos_sectionsfile()
  """
  if form_file_path:
    print('')
    print('There is a file for submit_gos')
    print('')
    # print(form_file_path)
    # print('')
    # print(open(form_file_path, 'r').read())
    # TODO: Check for 'flat' or 'section' key
    # Return found key or file to download?
    data = gta.wr_xlsx_gos_sectionsfile(filename, goids, form_file_path)
    print(data)
    return data

    """
    Text files with a list of GO id's are parsed client side and submitted
    in form['goids']
    """
  else:
    print('\nNo file sent to submit_gos\n')
    # TODO: Check for 'flat' or 'sections' key
    # Return found key or the file to download
    data = gta.wr_xlsx_gos(filename, goids)
    print(data)
    return data

# Accepts 'flat' or 'sections' key in submit_gos() data object
def nts_to_json(data):
  # print('\nNts to JSON says:\n')
  # print(data)
  json_data = {
    "nts": []
  }
  for nt in data:
    print('')
    print(type(nt))
    print(json_data)
    print('')
    json_data['nts'].append(json.dumps(nt._asdict()))
  return json_data['nts']


  # print(response_object['flat']) #Access the 'flat table'

  # print(response_object['flat'][0]) # Access one table row

#
def make_sections_file(user, group_name, goids, grprdflt=FLAT_GROUPS):
  directory = "./data_files/tmp/sections_txt/"  + str(user) + '/'
  filename = directory + group_name

  if not os.path.exists(directory):
    try:
      os.makedirs(directory)
    except:
      pass

  # Make the file
  gta.wr_sections_txt(filename, goids, grprdflt=FLAT_GROUPS)

  # Create JSON representation of file
  content = open(filename, 'rb').read()
  lines = content.split('\n')
  test_obj = {}

  group = ''
  section = ''
  for line in lines:
    if '# GROUP' in line:
      group = line.strip('# GROUP NAME:')
      test_obj['groups'] = { group: { 'line': line, 'sections': {} } }
    elif '# SECTION' in line:
      section = line.strip('# SECTION:')
      test_obj['groups'][group]['sections'][section] = { 'line': line, 'gos': [] }
      print section
    else:
      test_obj['groups'][group]['sections'][section]['gos'].append(line)

  return filename
  # return test_obj


def get_list(data):
  for key in data:
    if key == 'list_2d':
      return data['list_2d']
    else:
      return data['list_1d']

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
