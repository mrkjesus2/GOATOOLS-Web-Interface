from __future__ import unicode_literals
import os

# Temporary, should be covered in helpers.py
import sys
sys.path.append('/home/vagrant/goatools_alpha')

from django.db import models
from jsonfield import JSONField
from django.conf import settings
from django.core.files.base import ContentFile
from .helpers import ensure_path_exists
from goatools_alpha.socket.socket_client import GrouperSocketClient as Socket
import json

# This causes no file ./manage.py error
# from goatools_alpha.grouper_socket import GrouperSocketClient as Socket

def user_directory_path(instance, filename):
  return 'data_files/tmp/{0}/{1}'.format(instance.id, filename)

# Create your models here.
# TODO: Should I Use the ORM provided by Models
class GoIds(models.Model):
  go_ids = models.TextField(max_length=40000, default='GO:1234567')
  file_out_name = models.CharField(max_length=30, null=True)
  sections_file = models.FileField(upload_to=user_directory_path, null=True)
  xlsx_file = models.FileField(upload_to=user_directory_path, null=True)
  xlsx_data = models.TextField(max_length=80000)
  json_data = JSONField()

  # Do I need to add
  # sections = models.CharField

  def __str__(self):
    return self.go_ids

  def delete(self):
    # Model TODO: Going to need some checks here
    # print(self.sections_file.name)
    # TODO: Handle case where no sections file exists
    if self.sections_file.name != '':
      os.remove(self.sections_file.name)
    print(self.file_out_name)
    os.remove(self.xlsx_file.name)
    super(GoIds, self).delete()

# Returns 'list_2d' in object with sections and related goids
  def get_sections_goids(self, sections):
    # sections = [('section1', ["GO:0007049", "GO:0022402", "GO:0022403", "GO:0000279", "GO:0006259"]),
    #             ('section2', ["GO:0007049", "GO:0022402", "GO:0022403", "GO:0000279", "GO:0006259"])]

    rq = 'get_sections_goids'
    goids = self.go_ids.split(',')

    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':sections
      }
    )
    return data


  def get_sections_details(self, sections):
    rq = 'get_sections_nts'
    goids = self.go_ids.split(',')

    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':sections
      }
    )
    print
    print type(data['nts_2d'])
    print
    # return data['list_2d'] or data['nts_2d']
    return data


# Why does this expect a sections-file
  def make_sections_file(self, sections):
    '''
    Create a default sections file if user hasn't uploaded a file
    '''
    if self.sections_file:
      print '\nThere is a sections file'
    else:
      path = user_directory_path(self, '')
      ensure_path_exists(path)
      self.sections_file.save('default_sections.txt', ContentFile(''))

    '''
    Call the socket server to create the sections file
    '''
    rq = 'wr_txt_sections'
    goids = self.go_ids.split(',')
    # TODO: Is this safe in production?
    file = settings.BASE_DIR + '/' + self.sections_file.name

    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':sections,
        'outfile':file
      }
    )
    return data


  def get_xlsx_data(self, sections):
    '''
    Send request to Socket server for data
    '''
    rq = 'get_xlsx_data'

    goids = self.go_ids.split(',')
    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':sections
      }
    )

    '''
    Return either 2d or 1d list of xlsx data
    '''
    if sections:
      print('\nget_xlsx_data returning 2d list\n')
      return data['nts_2d']
    else:
      print('\nget_xlsx_data returning 1d list\n')
    return data['nts_1d']


# Sections don't seem to be making a difference
  def wr_xlsx_data(self, sections):
    # sections = [('section1', ["GO:0007049", "GO:0022402", "GO:0022403", "GO:0000279", "GO:0006259"]),
    #             ('section2', ["GO:0007049", "GO:0022402", "GO:0022403", "GO:0000279", "GO:0006259"])]
    # Returns ['status', 'hdrs', 'list_len', list_1d', 'rqid', 'nts_1d', 'rq']
    # If sections are provided 1d keys are 2d
    print('\nTesting\n')

    # self.xlsx_file.save('testing_contentfile.xlsx', ContentFile(data['nts_1d']))

    '''
    Create the directories and file to prevent
    'No such file or directory' error in GOATOOLS
    '''
    directory = settings.BASE_DIR + '/' + user_directory_path(self, '')
    file = directory + self.file_out_name
    ensure_path_exists(directory)


    '''
    Call the socket server to make the Excel file
    '''
    rq = 'wr_xlsx'
    goids = self.go_ids.split(',')

    data = Socket().send_request(
      {
        'rqid':self.id,
        'rq':rq,
        'usrgos':goids,
        'sections':sections,
        'outfile':file
      }
    )

    '''
    Set the file on the model
    '''
    self.xlsx_file = file
    print '\nXLSX FILE\n'
    print self.xlsx_file

    return
