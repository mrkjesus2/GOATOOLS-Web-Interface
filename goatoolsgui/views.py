from django.urls import reverse
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, FileResponse, JsonResponse
from django.core.files.base import ContentFile

import json
import collections

from .models import GoIds, PlotGroupThread
from .forms import GoIdsForm
from .helpers import submit_gos, nts_to_json, make_sections_file, json_obj_to_dict

from goatools_alpha.read_goids import read_sections, read_goids
import os

# Create your views here.
def index(request):
  if request.session.is_empty():
    print ''
    print "THERE IS NO USER DATA"
    print ''
  if request.method == 'POST':
    form = GoIdsForm(request.POST, request.FILES)
    if form.is_valid():
      '''
      Set the user data
      '''
      # Prevent creating new user if back button pressed on goatoolsgui:show
      if request.session.is_empty():
        user_data = GoIds()
      else:
        user_data = GoIds.objects.get(pk=request.session['user_data_id'])

      # Set common user data
      user_data.go_ids = request.POST.get('goids').replace(' ', '')
      user_data.file_out_name = request.POST.get('filename') + '.xlsx'
      user_data.save()

      # Temporarily save 'Sections File' and send to submit_gos()
      if request.FILES.get('sections_file'):
        user_data.sections_file = request.FILES.get('sections_file')
        user_data.save()

      # blob_file is used by gjoneska examples since we can't add files
      # to the file input for the user
      elif request.POST.get('blob_file'):
        file_contents = request.POST.get('blob_file')
        user_data.sections_file.save('example-sections.txt', ContentFile(file_contents))

      # Set xlsx_data
      user_data.json_data = user_data.get_xlsx_data()
      user_data.save()

      # Trying plots
      PlotGroupThread(user_data).start()

      # Set the user data in session
      request.session['user_data_id'] = user_data.id

      return HttpResponseRedirect(reverse('goatoolsgui:show'))
  else:
    form = GoIdsForm(auto_id=True)
  return render(request, 'goatoolsgui/base_form.html', {'form': form})


def showGos(request):
  goid_object = GoIds.objects.get(pk=request.session['user_data_id'])
  #
  # print ''
  # print 'Show Gos says:'
  # print type(goid_object.json_data[0][0]) == unicode
  # print ''

  if type(goid_object.json_data[0][0]) == unicode:
    print 'We need to handle 2d list'
    return render(request, 'goatoolsgui/base_results.html', {'goids_2d': goid_object})
  else:
    return render(request, 'goatoolsgui/base_results.html', {'goids': goid_object})

def showPlots(request):
  user_data = GoIds.objects.get(pk=request.session['user_data_id'])

  response = JsonResponse(user_data.plot_data, safe=False)

  return response

def sendFile(request):
  # TODO: Make sure that this is a robust solution
  user_gos_obj = GoIds.objects.get(pk=request.session['user_data_id'])
  '''
  Make the file
  '''
  # TODO: What if there are sections?
  user_gos_obj.wr_xlsx_data()

  '''
  Open the file to download
  '''
  filename = user_gos_obj.file_out_name
  file = user_gos_obj.xlsx_file.name
  file_contents = open(file, 'r')

  '''
  Set the Response header for file download
  '''
  # TODO: Does the MIME type need to change
  response = HttpResponse(file_contents, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  response['Content-Disposition'] = 'attachment; filename="%s"' % filename

  '''
  Close and delete the file
  '''
  file_contents.close()
  user_gos_obj.xlsx_file.delete(save=True)

  return response

def generateSections(request):
  '''
  Create user session if it doesn't exist
  '''
  # if request.session.is_empty():
  if not request.session.has_key('user_data_id'):
    print '\nNo session data found\n'
    user_data = GoIds()
    user_data.save()
    request.session['user_data_id'] = user_data.id
  else:
    print '\nThere is session data\n'
    user_data = GoIds.objects.get(pk=request.session['user_data_id'])

  '''
  Make the call and send response
  '''
  user_data.go_ids = request.POST.get('goids')
  group = request.POST.get('group-name')

  if request.POST.get('sections'):
    user_data.sections = json_obj_to_dict(request.POST['sections']).items()
  else:
    user_data.sections = None

  sections_file = user_data.make_sections_file()['outfile']
  response = FileResponse(open(sections_file, 'rb'))

  # response = JsonResponse(user_data.get_sections_details(sections), safe=False)
  return response

def sendExample(request):
  print '\nSend Example has been called'
  # Read the correct file based on id of clicked element
  goids_filename = request.GET.get('type') + '.txt'
  goids = read_goids(os.getcwd() + '/data_files/' + goids_filename)['goids']

  # Return the sections file name that is used by all examples
  sections_file_name = 'examples-sections.txt'
  sections_file_path = '/var/www/projects/gosite/data_files/' + sections_file_name
  sections_file = open(sections_file_path)
  sections = sections_file.read()

  json_obj = {
    'goids': ', '.join(goids),
    'sections_data': sections,
    'sections_name': sections_file_name
  }

  # Return the goids that are in the file as comma separated string
  return JsonResponse(json_obj)
