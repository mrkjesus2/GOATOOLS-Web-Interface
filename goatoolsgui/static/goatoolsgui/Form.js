/* global $ Sections Goids FileEditor */

var Form = (function() {
  'use strict';

  var Module = {
    els: {
      form: $('#goid-form'),
      intro: $('.intro'),
      submitBtn: $('#form__submit-btn')
    },

    init: function(options) {
      options = options || {};

      this.els.form.on('reset', onReset.bind(this));
    },

    teardown: function() {
      this.els.form.off('reset', onReset.bind(this));
    },

    display: function() {
      // s.gosInput.val(this.goids);
    },

    addError: function(msg) {
      onError.bind(this)(msg);
    },

    removeErrors: function() {
      offError.bind(this)();
    }

    // BEGIN TESTING API
    // submitForm: submitForm,
    // checkAuthentication: checkAuthentication
    // END TESTING API
  };
  return Module;

  function onReset() {
    Sections.reset();
    Goids.reset();
  }

  function onError(msg) {
    var $el = $('<div/>', {
      class: 'alert alert-danger',
      role: 'alert',
      text: msg
    });

    var $dismissBtn = $('<button/>', {
      'class': 'close',
      'type': 'button',
      'aria-label': 'Close',
      'onclick': 'Form.removeErrors()'
    });

    $dismissBtn.html('<span aria-hidden="true">&times;</span>');
    $el.append($dismissBtn);
    this.els.intro.append($el);
  }

  function offError() {
    $('.alert').remove();
  }
})();


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
})();
