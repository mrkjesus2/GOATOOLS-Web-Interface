from __future__ import unicode_literals
import os

from django.db import models
from jsonfield import JSONField

# Create your models here.
# TODO: Should I Use the ORM provided by Models
class GoIds(models.Model):
  sections_file = models.FileField(upload_to='tmp/', null=True)
  go_ids = models.TextField(max_length=40000, default='GO:1234567')
  file_out_name = models.CharField(max_length=30, null=True)
  xlsx_data = models.TextField(max_length=80000)
  json_data = JSONField()

  def __str__(self):
    return self.go_ids

  def delete(self):
    # Model TODO: Going to need some checks here
    # print(self.sections_file.name)
    # TODO: Handle case where no sections file exists
    if self.sections_file.name != '':
      os.remove(self.sections_file.name)
    print(self.file_out_name)
    os.remove(self.file_out_name)
    super(GoIds, self).delete()
