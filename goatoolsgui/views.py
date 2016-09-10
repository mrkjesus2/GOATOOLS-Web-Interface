from django.shortcuts import render
from django.http import HttpResponseRedirect

from .models import GoIds
from .forms import GoIdsForm
from .helpers import submit_gos

# Create your views here.
def index(request):
  if request.method == 'POST':
    form = GoIdsForm(request.POST, request.FILES)
    if form.is_valid() and request.FILES:
      instance = GoIds(file=request.FILES['sections_file'])
      instance.save()
      print(submit_gos(request.POST, instance.file.url))
      instance.delete()
      return HttpResponseRedirect('/show/')
    elif form.is_valid():
      print(submit_gos(request.POST))
  else:
    form = GoIdsForm(auto_id=True)
  return render(request, 'goatoolsgui/index.html', {'form': form})

def showGos(request):
  # goids = request.POST.copy() # POST and GET objects are immutable
  # print()
  # print("Here's where I want the value")
  # print(request.GET)
  return render(request, 'goatoolsgui/show.html')

def sendFile(request):
  # Will need to return 'Content-Disposition'
  return render(request, 'goatoolsgui/')
