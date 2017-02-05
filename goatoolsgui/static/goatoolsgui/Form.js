/* global $ sectionsStringArray callServer createTxtFileHtml document Blob */
// var Goatools = Goatools || {};
var Form = (function() {
  'use strict';

  var Module = {
    els: {
      form: $('#goid-form'),
    },

    init: function(options) {
      options = options || {};

      this.els.form.on('reset', onReset.bind(this));
    },

    teardown: function () {
      this.els.form.off('reset', onReset.bind(this));
    },

    display: function() {
      // s.gosInput.val(this.goids);
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
    Sections.els.blobInput.val(null);

    // TODO: Empty the variables that have been set on this object
    // Sections.reset();
    // Goids.reset();
    // FileDownload.reset();
  }

  function onFileNameInput(ev) {

  }
}());


(function() {
  'use strict';
  var goids = Object.create(Goids);
  goids.init();
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
