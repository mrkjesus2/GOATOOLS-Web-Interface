from django import forms

class GoIdsForm(forms.Form):
  # File select radio button choices
  gos_file = forms.FileField(
    label='Or upload a GO ids file',
    required=False,
    widget=forms.ClearableFileInput(
      attrs={
        'class': 'goids-form__input goids-form__input--file',
        'onchange': 'readFile(this.files)'
      }
    )
  )

  sections_file = forms.FileField(
    label='Upload a sections file',
    required=False,
    widget=forms.ClearableFileInput(
      attrs={
        'class': 'goids-form__input goids-form__input--file'
      }
    )
  )

  goids = forms.CharField(
    label='Enter your go ids',
    max_length=10000,
    widget=forms.TextInput(
      attrs={
        'placeholder': 'ex: GO:0008629',
        'class': 'goids-form__input goids-form__input--text'
      }
    )
  )

  filename = forms.CharField(
    label='Name your file',
    max_length=20,
    widget=forms.TextInput(
      attrs={
        'placeholder': 'ex: yourfilename',
        'class': 'goids-form__input goids-form__input--text'
      }
    )
  )
  # headerids = forms.CharField(label='Enter your header ids: ', max_length=1000, required=False)

