from django.conf.urls import url
from . import views

app_name = 'goatoolsgui'
urlpatterns = [
  url(r'^$', views.index, name='index'),
  url(r'^show/$', views.showGos, name='show'),
  url(r'^sendfile/$', views.sendFile, name='sendfile'),
]
