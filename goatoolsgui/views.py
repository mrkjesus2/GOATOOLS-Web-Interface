from django.shortcuts import render
from django.views import generic

# Create your views here.
def index(request):
  return render(request, 'goatoolsgui/index.html')

def showGos(request):
  return render(request, 'goatoolsgui/show.html')

def sendFile(request):
  return render(request, 'goatoolsgui/')
