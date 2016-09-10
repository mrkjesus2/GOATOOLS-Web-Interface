from django import forms

class GoIdsForm(forms.Form):
  # UI TODO: Going to want placeholders on some of these
  goids = forms.CharField(label='Enter your go ids', max_length=1000)
  gos_file = forms.FileField(label='Or upload a GO ids file', required=False)
  # headerids = forms.CharField(label='Enter your header ids: ', max_length=1000, required=False)
  filename = forms.CharField(label='Name your file', max_length=20)
  sections_file = forms.FileField(label='Upload a sections file', required=False)
