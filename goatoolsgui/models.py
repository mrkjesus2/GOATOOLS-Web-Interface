from __future__ import unicode_literals
import os

from django.db import models

# Create your models here.
# TODO: Should I Use the ORM provided by Models
class GoIds(models.Model):
  sections_file = models.FileField(upload_to='tmp/')

  def delete(self, *args, **kwargs):
    # Model TODO: Going to need some checks here
    os.remove(self.file.name)
