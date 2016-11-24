from go_site.settings.base import *
from go_site.settings.secret_settings import *
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# INSTALLED_APPS += (
#   'livereload'
# )

# MIDDLEWARE += (
#   'livereload.middleware.LiveReloadScript'
# )

LIVERELOAD_HOST = 'gosite.dev'
