
var Sections = (function() {
  'use strict';

  var Module = {
    els: {
      sectionsGroups: $('.sections-file__group'),
      blobInput: $('#blob_file'),
      fileName: $('#sections-file-name'),
      input: $('#sections_file')
    },

    init: function() {
      this.els.input.on('change', onInput.bind(this));
    },

    setSections: function(fileName, sections, wasBlob) {
      // console.log('Setting sections in Sections module');
      if (arguments.length > 0) {
        this.sectionsFile = fileName;
        this.sections = sections;

        if (wasBlob) {
          this.els.input.val(null);
          this.els.blobInput.val(sections);
        } else {
          this.els.blobInput.val(null);
        }
      }

      addToEditor.bind(this)(); // Presently causing an error
      this.display();
    },

    // Not sure that I need this one
    display: function() {
      this.els.fileName.text(this.sectionsFile);
    },

    reset: function() {
      this.sections = '';
      this.els.blobInput.val(null);
      this.sectionsFile = 'Optional';
      this.display();
      FileEditor.reset();
    }
  };
  return Module;

  function onInput(ev) {
    Goatools.File.read(ev.target.files[0], Goatools.File.Sections.addName);
  }

  function addToEditor() {
    createTxtFileHtml(this.sections.split('# SECTION:'));
    FileEditor.show();
  }
}());
