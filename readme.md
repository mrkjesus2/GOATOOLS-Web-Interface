### Moving to production
- Make sure that any development shortcuts are commented out
- Ensure that you are the appropriate git branch
- In the development machine, run `python ./manage.py collectstatic`
- Make sure to use cygwin to connect to Digital Ocean server
- If the machine already exists:
  - Run `vagrant provision` to move project changes to server
  - Change `sendExample()` in `views.py` to use the goids variable with the absolute path
and not `os-getcwd()`
- If the machine doesn't exist:
  - Run `vagrant up`
  - Wait for about 20 minutes
  - Set the IP address assigned in `/etc/apache2/sites-enabled/25-...` and
add to `ALLOWED_HOSTS` in `/var/www/projects/gosite/go_site/settings/production.py`
  - Change `sendExample()` in `views.py` to use the goids variable with the absolute path
and not `os-getcwd()`
  - Reset the apache server with `sudo service apache2 restart`
