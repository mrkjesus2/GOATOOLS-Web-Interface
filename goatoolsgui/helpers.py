# This is where calls to goatools_alpha are to be made

# TODO: Shouldn't be necessary in production
import sys
sys.path.append('/home/vagrant/goatools_alpha')
import os
# os.chdir('/var/www/projects/gosite/data_files/')
# End comment

import goatools
from goatools_alpha import gosubdag_grouper as gta
from datetime import datetime
import json
from django.core.cache import cache


# Here to speed development
os.chdir('/var/www/projects/gosite/data_files/')
FLAT_GROUPS = gta.GrouperDflts()
os.chdir('/var/www/projects/gosite/')
# /speed development


# TODO: Pass a boolean stating wheter a file download is wanted?
def submit_gos(form, form_file_path=None):
  goids = str(form.get('goids')).translate(None, ',').split()
  filename = str(form.get('filename'))
  # print(goids)

  """
  Any file that is passed will be a 'sections' file and must be passed to
  wr_xlsx_gos_sectionsfile()
  """
  if form_file_path:
    print('')
    print('There is a file for submit_gos')
    print('')
    # TODO: Check for 'flat' or 'section' key
    # Return found key or file to download?
    data = gta.wr_xlsx_gos_sectionsfile(filename, goids, form_file_path, grprdflt=FLAT_GROUPS)
    print(data['flat'])
    return data['flat']

    """
    Text files with a list of GO id's are parsed client side and submitted
    in form['goids']
    """
  else:
    print('\nNo file sent to submit_gos\n')
    # TODO: Check for 'flat' or 'sections' key
    # Return found key or the file to download
    data = gta.wr_xlsx_gos(filename, goids, grprdflt=FLAT_GROUPS)
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
# def make_sections_file(section_name, goids, grprdflt=FLAT_GROUPS):
#   start_time = datetime.now()
#   group_obj = gta.GrouperUserGos(section_name, goids)
#   group_obj.grprobj.wr_txt_section_hdrgos(section_name + '_hdrgos.txt')
#   end_time = datetime.now()
#   print '\n'
#   print end_time - start_time
#   print '\n'
#   return
