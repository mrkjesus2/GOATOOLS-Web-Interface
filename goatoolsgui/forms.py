from django import forms

class GoIdsForm(forms.Form):
  goids = forms.CharField(label='Enter your go ids: ', max_length=1000)
  headerids = forms.CharField(label='Enter your header ids: ', max_length=1000, required=False)
  filename = forms.CharField(label='Name your file: ', max_length=20)
  file = forms.FileField(label='Upload a section or GO file', required=False)
