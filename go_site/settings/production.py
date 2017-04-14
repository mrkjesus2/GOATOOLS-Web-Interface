from go_site.settings.base import *
from go_site.settings.secret_settings import *
import os

# A misguided? attempt at detecting the server ip address and adding to ALLOWED_HOSTS
# IP_ADDR = os.popen("ifconfig eth0 | grep inet | awk'{print $2}' | sed -e s/.*://", "r").read().rstrip()


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
  '.gosite.dev',
  '.gosite.dev.',
  '.gosite.production',
  '.gosite.production.',
  # '.' + IP_ADDR,
  # '.' + IP_ADDR + '.',
  '.198.199.121.164',
  '.198.199.121.164.',
  '.192.241.142.207',
  '.192.241.142.207.',
]

# INSTALLED_APPS += (
#   'django.contrib.staticfiles' ## Can I get away with this?
# )

# Allow the browser to help detect XSS attacks
SECURE_BROWSER_XSS_FILTER=True

# Prevent site from being loaded in iframes
# X_FRAME_OPTIONS=DENY

# Client-side Javascript can't access the cookie
# CSRF_COOKIE_HTTPONLY=True # This prevented AJAX calls from working properly

#
# Future Implementation
#
# If we serve files uploaded by users
# SECURE_CONTENT_TYPE_NOSNIFF=True ## Look into this one

# If HTTPS needs to be enabled
# SECURE_HSTS_SECONDS=
# SECURE_SSL_REDIRECT=True ## Look into this one
# SESSION_COOKIE_SECURE=True
# CSRF_COOKIE_SECURE=True

# To implement email:
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# DEFAULT_FROM_EMAIL
# SERVER_EMAIL


# DEPLOY-TODO: Configure Apache allowed hosts
# DEPLOY-TODO: Database/Cache servers only accept connections from application server?
# DEPLOY-TODO: Make sure uploaded files aren't executed


# For Performance
CONN_MAX_AGE = 600
# Cached template loader?

# DEPLOY-TODO: Enable logging
# DEPLOY-TODO: PYTHONHASHSEED=random in Apache config
