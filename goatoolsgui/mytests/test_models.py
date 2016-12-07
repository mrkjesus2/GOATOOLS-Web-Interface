from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from goatoolsgui.models import GoIds, user_directory_path

class GoidsMethodsTestCase(TestCase):
  # Remove files created during tests
  def tearDown(self):
    print ''
    self.goids_only.delete()
    self.goids_sections.delete()

  # Create an object with and without a sections file
  def setUp(self):
    self.goids_only = GoIds.objects.create(
      go_ids = 'GO:0042391, GO:0007612', #, GO:0050806, GO:0006734, GO:0050804, GO:0034765, GO:0060048, GO:0008542, GO:0051186, GO:0015991, GO:0006887, GO:0035249, GO:0017158, GO:0045956, GO:0006874, GO:0017157, GO:0032501, GO:0006813, GO:0050877, GO:0006811, GO:0006810, GO:0048172, GO:0007269, GO:0007268, GO:0060079, GO:0032879, GO:0055085, GO:0016192, GO:0007399, GO:0048791, GO:0051960, GO:0051965, GO:0099531, GO:0099536, GO:0006887, GO:0006887, GO:0006810, GO:0016192, GO:0006810, GO:0006813, GO:0007269, GO:0032501',
      file_out_name = 'test-file-out-name',
    )

    self.goids_sections = GoIds.objects.create(
      go_ids = 'GO:0042391,GO:0007612', #,GO:0050806,GO:0006734,GO:0050804,GO:0034765,GO:0060048,GO:0008542,GO:0051186,GO:0015991,GO:0006887,GO:0035249,GO:0017158,GO:0045956,GO:0006874,GO:0017157,GO:0032501,GO:0006813,GO:0050877,GO:0006811,GO:0006810,GO:0048172,GO:0007269,GO:0007268,GO:0060079,GO:0032879,GO:0055085,GO:0016192,GO:0007399,GO:0048791,GO:0051960,GO:0051965,GO:0099531,GO:0099536,GO:0006887,GO:0006887,GO:0006810,GO:0016192,GO:0006810,GO:0006813,GO:0007269,GO:0032501',
      file_out_name = 'test-file-out-name',
      sections_file = 'proj_sections.txt',
    )

  '''
  Basic method tests for the socket server
  '''
  def test_get_sections_goids_without_sections(self):
    obj = self.goids_only
    self.assertEqual(obj.get_sections_goids()['status'], 'PASS:SUCCESS')

  def test_get_sections_goids_with_sections(self):
    obj = self.goids_sections
    self.assertEqual(obj.get_sections_goids()['status'], 'PASS:SUCCESS')

  def test_get_sections_details_without_sections(self):
    obj = self.goids_only
    self.assertEqual(obj.get_sections_details()['status'], 'PASS:SUCCESS')

  def test_get_sections_details_with_sections(self):
    obj = self.goids_sections
    self.assertEqual(obj.get_sections_details()['status'], 'PASS:SUCCESS')

  def test_make_sections_file_without_sections(self):
    obj = self.goids_only
    obj.make_sections_file()
    self.assertIsNotNone(obj.sections_file.name)

  # TODO: Should I test for a changed sections file
  def test_make_sections_file_with_sections(self):
    obj = self.goids_sections
    obj.make_sections_file()
    self.assertIsNotNone(obj.sections_file.name)

  def test_get_xlsx_data_without_sections(self):
    obj = self.goids_only
    self.assertIsNotNone(obj.get_xlsx_data())

  def test_get_xlsx_data_with_sections(self):
    obj = self.goids_sections
    self.assertIsNotNone(obj.get_xlsx_data())

  def test_wr_xlsx_data_without_sections(self):
    obj = self.goids_only
    obj.wr_xlsx_data()
    self.assertIsNotNone(obj.xlsx_file)

  def test_wr_xlsx_data_with_sections(self):
    obj = self.goids_sections
    obj.wr_xlsx_data()
    self.assertIsNotNone(obj.xlsx_file)

  def test_get_plot_groups_without_sections(self):
    obj = self.goids_only
    self.assertTrue(len(obj.get_plot_groups()) > 0)

  def test_get_plot_groups_with_sections(self):
    obj = self.goids_sections
    self.assertTrue(len(obj.get_plot_groups()) > 0)
