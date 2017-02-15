from django import forms

class GoIdsForm(forms.Form):
  # File select radio button choices
  gos_file = forms.FileField(
    label='Or upload a GO ids file',
    required=False,
    widget=forms.ClearableFileInput(
      attrs={
        'class': 'input-file',
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
      }
    )
  )

  blob_file = forms.CharField(
    required=False,
    widget=forms.HiddenInput()
  )

  goids = forms.CharField(
    label='Enter your go ids',
    max_length=10000,
    required=True,
    widget=forms.Textarea(
      attrs={
        'placeholder': 'ex: GO:0008629',
        'class': 'form-control'
      }
    )
  )

  group_name = forms.CharField(
    label="Name your group",
    required=False,
    max_length=36,
    widget=forms.TextInput(
      attrs={
        'placeholder': 'Do I want a placeholder',
        'class': 'form-control'
      }
    )
  )

  section_names = forms.CharField(
    label="Add your custom sections",
    required=False,
    max_length=100,
    widget=forms.TextInput(
      attrs={
        'placeholder': 'Placeholder here',
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
