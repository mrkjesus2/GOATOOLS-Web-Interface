from __future__ import unicode_literals
import os

from django.db import models

# Create your models here.
# TODO: Should I Use the ORM provided by Models
class GoIds(models.Model):
  file = models.FileField(upload_to='tmp/')

  def delete(self, *args, **kwargs):
    os.remove(self.file.name)
