# This is where calls to goatools_alpha are to be made

# TODO: Shouldn't be necessary in production
import sys
sys.path.append('/home/vagrant/goatools_alpha')
import os
os.chdir('/var/www/go_site/data_files/')
# End comment

import goatools
from goatools_alpha.gosubdag_grouper import wr_xlsx_gos, wr_xlsx_gos_sectionsfile, prt_gos, get_sorted_nts
from datetime import datetime
import json


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
    # TODO: Check for 'flat' or 'section' key
    # Return found key or file to download?
    data = wr_xlsx_gos_sectionsfile(filename, goids, form_file_path)
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
    data = wr_xlsx_gos(filename, goids)
    return data

# Accepts 'flat' or 'sections' key in submit_gos() data object
def nts_to_json(data):
  json_data = {
    "nts": []
  }
  for nt in data:
    json_data['nts'].append(json.dumps(nt._asdict()))
  return json_data


  # print(response_object['flat']) #Access the 'flat table'

  # print(response_object['flat'][0]) # Access one table row

