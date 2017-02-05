/* global $ sectionsStringArray callServer createTxtFileHtml document Blob */
// var Goatools = Goatools || {};
var s;
var Form = (function() {
  'use strict';

  var Module = {
    els: {
      gosInput: $('#goids'),
      gosFileInput: $('#gos_file'),
      examples: $('#example-group'),
      form: $('#goid-form'),
    },

    init: function(options) {
      options = options || {};
      s = this.els;

      s.form.on('reset', onReset.bind(this));
      s.gosFileInput.on('change', onGoidInput.bind(this));
      s.examples.on('click', onExampleSelect.bind(this));
    },

    teardown: function () {
      s.form.off('reset', onReset.bind(this));
      s.gosFileInput.off('change', onGoidInput.bind(this));
      s.examples.off('click', onExampleSelect.bind(this));
    },

    display: function() {
      s.gosInput.val(this.goids);
    },

    setGoids: function(ids) {
      this.goids = ids;
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

  function onGoidInput(ev) {
    Goatools.File.read(ev.target.files[0], Goatools.File.Goids.parse);
  }

  function onFileNameInput(ev) {

  }

  function onExampleSelect(ev) {
    Goatools.File.getExampleData(ev.target.parentElement.id);
  }
}());


(function() {
  'use strict';
  var editor = Object.create(FileEditor);
  editor.init();
  var sections = Object.create(Sections);
  sections.init();
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
