from django.conf.urls import url
from . import views

app_name = 'goatoolsgui'
urlpatterns = [
  url(r'^$', views.index, name='index'),
  url(r'^show/$', views.showGos, name='show'),
  url(r'^sendfile/$', views.sendFile, name='sendfile'),
  url(r'^generatesections/$', views.generateSections, name='generatesections'),
  url(r'^plots/$', views.showPlots, name='showplots'),
  url(r'^exampledata/$', views.sendExample, name='exampledata')
]
