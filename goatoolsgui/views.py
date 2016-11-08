from django.urls import reverse
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, FileResponse, JsonResponse

import json
import collections

from .models import GoIds
from .forms import GoIdsForm
from .helpers import submit_gos, nts_to_json, make_sections_file, json_obj_to_dict

# Create your views here.
def index(request):
  if request.method == 'POST':
    form = GoIdsForm(request.POST, request.FILES)
    if form.is_valid():
      user_data = GoIds()
      user_data.go_ids = request.POST.get('goids').replace(' ', '')
      user_data.file_out_name = request.POST.get('filename') + '.xlsx'
      user_data.save()
      # Temporarily save 'Sections File' and send to submit_gos()
      if request.FILES.get('sections_file'):
        user_data.sections_file = request.FILES.get('sections_file')
        user_data.save()
        # user_data.json_data = submit_gos(request.POST, user_data.sections_file.url)['sections']
        # user_data.save()
        user_data.get_xlsx_data(None)
      elif request.POST.get('blob_file'):
        user_data.sections_file = user_data.file_from_blob(request.POST.get('blob_file'))
        user_data.save()
        # user_data.json_data = submit_gos(request.POST, user_data.sections_file.url)['sections']
        # user_data.save()
      else:
        # user_data.json_data = submit_gos(request.POST)['flat']
        # print('\n\nView Says:')
        # print(user_data)
        # print('\n\n')
        user_data.save()
        user_data.get_sections(None)
      request.session['user_data_id'] = user_data.id

      return HttpResponseRedirect(reverse('goatoolsgui:show'))
  else:
    form = GoIdsForm(auto_id=True)
  return render(request, 'goatoolsgui/base_form.html', {'form': form})


def showGos(request):
  goid_object = GoIds.objects.get(pk=request.session['user_data_id'])
  # print('\n\nShow Gos says:')
  # print(goid_object)
  return render(request, 'goatoolsgui/base_results.html', {'goids': goid_object})


def sendFile(request):
  # TODO: Make sure that this is a robust solution
  user_gos_obj = GoIds.objects.get(pk=request.session['user_data_id'])

  # Opent the file to download
  filename = user_gos_obj.file_out_name
  file = open(filename, 'r')

  # Response header for file download
  # TODO: Does the MIME type need to change
  response = HttpResponse(file, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  response['Content-Disposition'] = 'attachment; filename="%s.xlsx"' % filename

  file.close()
  user_gos_obj.delete()
  return response


def generateSections(request):
  '''
  Create user session if it doesn't exist
  '''
  if request.session.is_empty():
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
    sections = json_obj_to_dict(request.POST['sections']).items()
  else:
    sections = None

  sections_file = user_data.make_sections_file(sections)['outfile']
  response = FileResponse(open(sections_file, 'rb'))

  # response = JsonResponse(user_data.get_sections_details(sections), safe=False)
  return response
