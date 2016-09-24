from django.urls import reverse
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse

from .models import GoIds
from .forms import GoIdsForm
from .helpers import submit_gos, nts_to_json

# Create your views here.
def index(request):
  if request.method == 'POST':
    form = GoIdsForm(request.POST, request.FILES)
    if form.is_valid():
      user_data = GoIds()
      user_data.go_ids = request.POST.get('goids')
      user_data.file_out_name = request.POST.get('filename')
      # Temporarily save 'Sections File' and send to submit_gos()
      if request.FILES.get('sections_file'):
        user_data.sections_file = request.FILES.get('sections_file')
        user_data.save()
        user_data.json_data = submit_gos(request.POST, user_data.sections_file.url)
        user_data.save()
      else:
        user_data.json_data = submit_gos(request.POST)['flat']
        user_data.save()
      request.session['user_data_id'] = user_data.id

      return HttpResponseRedirect(reverse('goatoolsgui:show'))
  else:
    form = GoIdsForm(auto_id=True)
  return render(request, 'goatoolsgui/base_form.html', {'form': form})


def showGos(request):
  goid_object = GoIds.objects.get(pk=request.session['user_data_id'])
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

