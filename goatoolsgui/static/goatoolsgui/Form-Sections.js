
var Sections = (function() {
  'use strict';

  var Module = {
    els: {
      sectionsGroups: $('.sections-file__group'),
      editorBtn: $('#editor__open-button'),
      blobInput: $('#blob_file'),
      fileName: $('#sections-file-name'),
      input: $('#sections_file')
    },

    init: function() {
      // console.log('Sections is initialized', this.els.editorBtn);
      this.els.input.on('change', onInput.bind(this));
      this.els.editorBtn.on('click', onEditorBtnClick.bind(this));
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
    }
  };
  return Module;

  function onInput(ev) {
    Goatools.File.read(ev.target.files[0], Goatools.File.Sections.addName);
  }

  function onEditorBtnClick() {
    Goatools.File.Sections.get();
    this.els.editorBtn.off('click');

    this.els.editorBtn
      .text('View/Edit')
      .removeClass('btn-primary')
      .addClass('btn-info')
      .on('click', FileEditor.show);
    // s.editorButton.on('click', Goatools.FileEditor.show());
  }

  function addToEditor() {
    createTxtFileHtml(this.sections.split('# SECTION:'));
    FileEditor.show();
  }
}());
