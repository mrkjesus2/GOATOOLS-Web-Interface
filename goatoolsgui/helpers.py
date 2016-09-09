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


# TODO: Pass a boolean stating wheter a file download is wanted?
def submit_gos(form, form_file_path=None):
  goids = str(form.get('goids')).translate(None, ',').split()
  filename = str(form.get('filename'))

  """
  Any file that is passed will be a 'sections' file and must be passed to
  wr_xlsx_gos_sectionsfile()
  """
  if form_file_path:
    # TODO: Check for 'flat' or 'section' key
    # Return found key or file to download?
    return wr_xlsx_gos_sectionsfile(filename, goids, form_file_path)
    """
    Text files with a list of GO id's are parsed client side and submitted
    in form['goids']
    """
  else:
    # TODO: Check for 'flat' or 'sections' key
    # Return found key or the file to download
    return wr_xlsx_gos(filename, goids)



  # print(response_object['flat']) #Access the 'flat table'

  # print(response_object['flat'][0]) # Access one table row

