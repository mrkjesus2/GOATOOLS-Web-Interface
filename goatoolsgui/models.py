from __future__ import unicode_literals
# import os
import shutil

# Temporary, should be covered in helpers.py
import sys
sys.path.append('/home/vagrant/goatools_alpha')

from django.db import models
from jsonfield import JSONField
from django.conf import settings
from django.core.files.base import ContentFile
from .helpers import ensure_path_exists
from goatools_alpha.socket.socket_client import GrouperSocketClient as Socket

# This causes no file ./manage.py error
# from goatools_alpha.grouper_socket import GrouperSocketClient as Socket

def user_directory_path(instance, filename):
  return settings.BASE_DIR + '/data_files/users/{0}/{1}'.format(instance.id, filename)


class GoIds(models.Model):
  go_ids = models.TextField(max_length=40000, default='GO:1234567')
  file_out_name = models.CharField(max_length=30, null=True)
  sections_file = models.FileField(upload_to=user_directory_path, null=True)
  xlsx_file = models.FileField(upload_to=user_directory_path, null=True)
  xlsx_data = models.TextField(max_length=80000)
  json_data = JSONField()
  plot_data = JSONField()
  sections = JSONField(null=True)

  # Do I need to add
  # sections = models.CharField

  def __str__(self):
    return self.go_ids

  def delete(self):
    path = user_directory_path(self, '')
    ensure_path_exists(path)
    shutil.rmtree(path)
    # Model TODO: Going to need some checks here
    super(GoIds, self).delete()

# Returns 'list_2d' in object with sections and related goids
  def get_sections_goids(self):
    # print('\nGetting Section GOIDs\n')
    # sections = [('section1', ["GO:0007049", "GO:0022402", "GO:0022403", "GO:0000279", "GO:0006259"]),
    #             ('section2', ["GO:0007049", "GO:0022402", "GO:0022403", "GO:0000279", "GO:0006259"])]

    rq = 'get_sections_goids'
    goids = self.go_ids.replace(' ', '').split(',')

    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':self.sections
      }
    )
    return data


  def get_sections_details(self):
    # print('\nGetting Section Details\n')
    rq = 'get_sections_nts'
    goids = self.go_ids.replace(' ', '').split(',')
    # print goids
    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':self.sections
      }
    )
    # return data['list_2d'] or data['nts_2d']
    return data


# Why does this expect a sections-file
  def make_sections_file(self):
    # print('\nMaking Sections File\n')
    '''
    Create a default sections file if user hasn't uploaded a file
    '''
    if self.sections_file:
      print '\nThere is a sections file'
    else:
      path = user_directory_path(self, '')
      ensure_path_exists(path)
      self.sections_file.save('default_sections.txt', ContentFile(''))
      self.sections_file.close()

    '''
    Call the socket server to create the sections file
    '''
    rq = 'wr_txt_sections'
    goids = self.go_ids.replace(' ', '').split(',')
    file = self.sections_file.name

    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':self.sections,
        'outfile':file
      }
    )
    return data


  def get_xlsx_data(self):
    # print('\nGetting XLSX Data\n')
    '''
    Send request to Socket server for data
    '''
    rq = 'get_xlsx_data'

    goids = self.go_ids.replace(' ', '').split(',')

    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':self.sections
      }
    )

    '''
    Return either 2d or 1d list of xlsx data
    '''
    if self.sections:
      # print('\nget_xlsx_data returning 2d list\n')
      return data['nts_2d']
    else:
      # print('\nget_xlsx_data returning 1d list\n')
      return data['nts_1d']


  # Sections don't seem to be making a difference
  def wr_xlsx_data(self):
    # print('\nWriting XLSX Data\n')
    # sections = [('section1', ["GO:0007049", "GO:0022402", "GO:0022403", "GO:0000279", "GO:0006259"]),
    #             ('section2', ["GO:0007049", "GO:0022402", "GO:0022403", "GO:0000279", "GO:0006259"])]
    # Returns ['status', 'hdrs', 'list_len', list_1d', 'rqid', 'nts_1d', 'rq']
    # If sections are provided 1d keys are 2d

    # self.xlsx_file.save('testing_contentfile.xlsx', ContentFile(data['nts_1d']))

    '''
    Create the directories and file to prevent
    'No such file or directory' error in GOATOOLS
    '''
    directory = user_directory_path(self, '')
    file = directory + self.file_out_name
    ensure_path_exists(directory)


    '''
    Call the socket server to make the Excel file
    '''
    rq = 'wr_xlsx'
    goids = self.go_ids.replace(' ', '').split(',')

    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':self.sections,
        'outfile':file
      }
    )

    '''
    Set the file on the model
    '''
    self.xlsx_file = file
    return

  def get_plot_groups(self):
    # print('\nGetting Plot Groups\n')
    # Set the Current User Directory as output for .png files
    directory = user_directory_path(self, '')
    ensure_path_exists(directory)

    rq = 'plot_groups'
    goids = self.go_ids.replace(' ', '').split(',')

    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'section':self.sections,
        'odir':directory
      }
    )

    files = data['list_1d']
    for idx, file in enumerate(files):
      # Set the url for the image
      files[idx] = file.replace(directory, '../media/users/' + str(self.id) + '/')

    return files


import threading
# Thank you - http://stackoverflow.com/questions/11632034/async-functions-in-django-views
class PlotGroupThread(threading.Thread):
  def __init__(self, obj, *args, **kwargs):
    self.obj = obj
    # self.sections = sections
    # print ''
    # print 'PlotGroupThread Initialized'
    # print ''
    super(PlotGroupThread, self).__init__(*args, **kwargs)

  def run(self):
    # print ''
    # print 'PlotGroupThread Running'
    # print ''
    self.obj.plot_data = self.obj.get_plot_groups()
    self.obj.save()
