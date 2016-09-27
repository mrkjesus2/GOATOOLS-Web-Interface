from django import forms

class GoIdsForm(forms.Form):
  # File select radio button choices
  gos_file = forms.FileField(
    label='Or upload a GO ids file',
    required=False,
    widget=forms.ClearableFileInput(
      attrs={
        'class': 'input-file',
        'onchange': 'readFile(this.files)',
        'style': 'width: 0.1px; height: 0.1px; opacity: 0; overflow: hidden; position: absolute; z-index: -1;'
      }
    )
  )

  sections_file = forms.FileField(
    label='Upload a sections file',
    required=False,
    widget=forms.ClearableFileInput(
      attrs={
        'class': 'input-file',
        'onchange': 'addFileName(this.files)'
      }
    )
  )

  goids = forms.CharField(
    label='Enter your go ids',
    max_length=10000,
    widget=forms.Textarea(
      attrs={
        'placeholder': 'ex: GO:0008629',
        'class': 'form-control'
      }
    )
  )

  filename = forms.CharField(
    label='Name your file',
    max_length=20,
    widget=forms.TextInput(
      attrs={
        'placeholder': 'ex: yourfilename',
        'class': 'form-control',
        'value': 'gene-ontology'
      }
    )
  )
  # headerids = forms.CharField(label='Enter your header ids: ', max_length=1000, required=False)

