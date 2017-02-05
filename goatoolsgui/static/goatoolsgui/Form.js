/* global $ sectionsStringArray callServer createTxtFileHtml document Blob */
// var Goatools = Goatools || {};
var s;
var Form = (function() {
  'use strict';

  var Module = {
    settings: {
      gosInput: $('#goids'),
      gosFileInput: $('#gos_file'),
      sectionsInput: $('#sections_file'),
      sectionsFileName: $('#sections-file-name'),
      blobInput: $('#blob_file'),
      examples: $('#example-group'),
      form: $('#goid-form'),
      closeButtons: $('.close'),
      editorButton: $('#editor__open-button'),
      sectionsGroups: $('.sections-file__group')
    },

    init: function(options) {
      options = options || {};
      s = this.settings;

      s.form.on('reset', onReset.bind(this));
      s.gosFileInput.on('change', onGoidInput.bind(this));
      s.sectionsInput.on('change', onSectionsInput.bind(this));
      s.examples.on('click', onExampleSelect.bind(this));
      // s.closeButtons.on('click', Goatools.File.Sections.reset);

      s.editorButton.on('click', onGenerate.bind(this));
    },

    teardown: function () {
      s.form.off('reset', onReset.bind(this));
      s.gosFileInput.off('change', onGoidInput.bind(this));
      s.sectionsInput.off('change', onSectionsInput.bind(this));
      s.examples.off('click', onExampleSelect.bind(this));
      s.closeButtons.off('click', Goatools.File.Sections.reset);

      s.editorButton.off('click');
    },

    display: function() {
      s.gosInput.val(this.goids);
      s.sectionsFileName.text(this.sectionsFile);
    },

    setGoids: function(ids) {
      this.goids = ids;
      this.display();
    },

    setSections: function(fileName, sections, wasBlob) {
      if (arguments.length > 0) {
        this.sectionsFile = fileName;
        this.sections = sections;

        if (wasBlob) {
          s.sectionsInput.val(null);
          s.blobInput.val(sections);
        } else {
          s.blobInput.val(null);
        }
      }
      addToEditor.bind(this)();
      this.display();
    },

    setFileDownloadName: function(name) {

    }

    // BEGIN TESTING API
    // submitForm: submitForm,
    // checkAuthentication: checkAuthentication
    // END TESTING API
  };
  return Module;

  function onReset() {
    // Empty the hidden input
    s.blobInput.val(null);

    // TODO: Empty the variables that have been set on this object
  }

  function onGenerate(ev) {
    Goatools.File.Sections.get();
    s.editorButton.off('click');

    s.editorButton
      .text('View/Edit')
      .removeClass('btn-primary')
      .addClass('btn-info')
      .on('click', editor.show);
    // s.editorButton.on('click', Goatools.FileEditor.show());
  }

  function onGoidInput(ev) {
    Goatools.File.read(ev.target.files[0], Goatools.File.Goids.parse);
  }

  function onSectionsInput(ev) {
    Goatools.File.read(ev.target.files[0], Goatools.File.Sections.addName);
  }

  function onFileNameInput(ev) {

  }

  function onExampleSelect(ev) {
    Goatools.File.getExampleData(ev.target.parentElement.id);
  }

  function addToEditor() {
    createTxtFileHtml(this.sections.split('# SECTION:'));
    Goatools.FileEditor.show();
  }
}());


(function() {
  'use strict';
  var editor = Object.create(Goatools.FileEditor);
  editor.init();
  // console.log(editor);
  var form = Object.create(Form);
  form.init();
  // console.log(form);
}());




function addErrMsg(el, msg) {
  console.log(el, msg);
  // select the element
  // append a div with msg after element
}
