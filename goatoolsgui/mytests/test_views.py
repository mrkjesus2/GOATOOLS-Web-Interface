from django.test import TestCase, Client
from django.urls import reverse
# from goatoolsgui.models import GoIds
from goatoolsgui import views
from goatoolsgui.models import GoIds


class ViewsTestCase(TestCase):
  def setUp(self):
    self.goids_obj = {
      'go_ids': 'GO:0042391, GO:0007612, GO:0050806, GO:0006734, GO:0050804, GO:0034765, GO:0060048, GO:0008542, GO:0051186, GO:0015991, GO:0006887, GO:0035249, GO:0017158, GO:0045956, GO:0006874, GO:0017157, GO:0032501, GO:0006813, GO:0050877, GO:0006811, GO:0006810, GO:0048172, GO:0007269, GO:0007268, GO:0060079, GO:0032879, GO:0055085, GO:0016192, GO:0007399, GO:0048791, GO:0051960, GO:0051965, GO:0099531, GO:0099536, GO:0006887, GO:0006887, GO:0006810, GO:0016192, GO:0006810, GO:0006813, GO:0007269, GO:0032501',
      'file_out_name': 'test-file-out-name',
      'sections_file': '/var/www/projects/gosite/data_files/proj_sections.txt',
    }

    self.instance = GoIds.objects.create(
      go_ids = self.goids_obj['go_ids'],
      file_out_name = self.goids_obj['file_out_name'],
      sections_file = self.goids_obj['sections_file']
    )

    # Need a client to make requests
    self.client = Client()

    # Set up session data
    self.session = self.client.session
    self.session['user_data_id'] = self.instance.id
    self.session.save()




  '''
  Index View Tests
  '''
  def test_index_no_post_data(self):
    response = self.client.get(reverse('goatoolsgui:index'))
    self.assertEqual(response.status_code, 200)


  def test_index_with_valid_post_data(self):
    url = reverse('goatoolsgui:index')
    sections_file = self.goids_obj['sections_file']

    with open(sections_file) as file:
      response = self.client.post(
        url,
        {
          'goids': self.instance.go_ids,
          'filename': self.instance.file_out_name,
          'sections_file': file
        },
        follow=True
      )
    # check for redirect to goatoolsgui:show
    self.assertEqual(views.showGos, response.resolver_match.func)


  def test_index_with_invalid_post_data(self):
    url = reverse('goatoolsgui:index')

    response = self.client.post(
      url,
      {
        'goids': self.instance.go_ids,
        # Long file name causes invalid form
        'filename': self.instance.file_out_name + '.xlsx'
      },
      follow=True
    )
    # check that index is returned
    self.assertEqual(views.index, response.resolver_match.func)


  def test_index_sets_user_data(self):
    # TODO: Write this test
    return



  '''
  showPlots View Tests
  '''
  def test_show_plots(self):
    url = reverse('goatoolsgui:showplots')

    response = self.client.get(url)
    # print response
    # should return JSON non-empty JSON response
    # https://docs.python.org/3/library/signal.html#example - This link may help
    return




  '''
  sendFile View Tests
  '''
  def test_send_file(self):
    url = reverse('goatoolsgui:sendfile')
    response = self.client.get(url)
    has_attachment = response._headers['content-disposition'][1].find('attachment')
    # should return a file
    self.assertNotEqual(has_attachment, -1)




  '''
  generateSections View Tests
  '''
  def test_generate_sections_with_session_data(self):
    url = reverse('goatoolsgui:generatesections')
    response = self.client.post(
      url,
      {
        'goids': self.instance.go_ids,
      }
    )
    self.assertEqual(response.status_code, 200)


  def test_generate_sections_without_session_data(self):
    url = reverse('goatoolsgui:generatesections')

    # clear session data for this test
    self.session.clear()
    self.session.save()

    response = self.client.post(
      url,
      {
        'goids': self.instance.go_ids,
      }
    )
    self.assertEqual(response.status_code, 200)
