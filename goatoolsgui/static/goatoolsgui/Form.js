/* global $ Sections Goids FileEditor */
console.log('Form is loading');
var Goatools = Goatools || {};
Goatools.Form = Goatools.Form || {};

(function() {
  'use strict';

  $.extend(true, Goatools.Form, {
    els: {
      form: $('#goid-form'),
      warningCont: $('#form__warning')
      // submitBtn: $('#form__submit-btn')
    },

    init: function(options) {
      options = options || {};

      this.els.form.on('reset', onReset.bind(this));
      // this.els.warningCont.on('submit', onSubmit.bind(this));
      this.els.form.on('submit', onSubmit.bind(this));
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

    removeError: function(ev) {
      offError.bind(this)(ev);
    }

    // BEGIN TESTING API
    // submitForm: submitForm,
    // checkAuthentication: checkAuthentication
    // END TESTING API
  });

  function onReset() {
    Goatools.Form.Sections.reset();
    Goatools.Form.Goids.reset();
  }

  function onSubmit(ev) {
    if (!Goatools.Form.Goids.validate()) {
      ev.preventDefault();
    } else {
      Goatools.showSpinner();
    }
  }

  function onError(msg) {
    var cont = this.els.warningCont;

    var $el = $('<div/>', {
      class: 'alert alert-danger alert-dismissable fade in',
      role: 'alert',
      text: msg
    });

    var $dismissBtn = $('<button/>', {
      'class': 'close',
      'type': 'button',
      'aria-label': 'Close',
      'onclick': 'Goatools.Form.removeError(this)'
      // 'data-dismiss': 'alert'
    });

    if (cont.children().length > 0) {
      cont.children().remove();
      cont.removeClass('in');
    }

    $dismissBtn.html('<span aria-hidden="true">&times;</span>');
    $el.prepend($dismissBtn);
    cont.append($el);
    cont.collapse('show');
  }

  function offError(ev) {
    this.els.warningCont.collapse('hide');
    $(ev).attr('data-dismiss', 'alert');
  }
})();

Goatools.Form.init();
