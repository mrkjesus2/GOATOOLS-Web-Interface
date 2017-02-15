/* global $ Goatools  */
var Goatools = Goatools || {};
Goatools.Form = Goatools.Form || {};
console.log('Goids is loading');
(function() {
  'use strict';

  Goatools.Form.Goids = {
    els: {
      cont: $('#form__goids-container'),
      input: $('#goids'),
      fileInput: $('#gos_file'),
      examples: $('#example-group')
    },

    init: function() {
      console.log('Goids initializing');
      this.els.fileInput.on('change', onFileChange.bind(this));
      this.els.examples.on('click', onExampleClick.bind(this));
      this.els.input.on('keyup', checkInput.bind(this));
    },

    display: function() {
      this.els.input.val(this.goids);
    },

    setGoids: function(ids) {
      this.goids = ids;
      this.display();
      areValid.bind(this)(this.goids);
    },

    reset: function() {
      this.goids = null;
    },

    validate: function() {
      if (this.goids && areValid.bind(this)(this.goids)) {
        return true;
      }
      addWarning.bind(this)();
      return false;
    }
  };

  function onFileChange(ev) {
    Goatools.File.read(ev.target.files[0], Goatools.File.Goids.parse);
  }

  function onExampleClick(ev) {
    Goatools.File.getExampleData(ev.target.parentElement.id);
  }

  function checkInput(ev) {
    ev.target.value = ev.target.value.toUpperCase();
    if (ev.keyCode === 32 || ev.keyCode === 188) {
      areValid.bind(this)(ev.target.value);
    }
  }

  function areValid(str) {
    var regx = /GO:[0-9]{0,7}/g;
    var leftovers = str.replace(regx, '');

    if (leftovers.match(/\w/)) {
      addWarning.bind(this)();
      return false;
    }
    removeWarning.bind(this)();
    return true;
  }

  function addWarning() {
    var $el = this.els.cont;
    var $warnText = $('<span/>', {
      class: 'help-block',
      text: 'There seems to be a problem with your IDs'
    });

    if (!$el.hasClass('has-error')) {
      $el.addClass('has-error');
      $el.append($warnText);
    }
  }

  function removeWarning() {
    var $el = this.els.cont;
    var $lastChild = this.els.cont.children().last();

    $el.removeClass('has-error');
    if ($lastChild.hasClass('help-block')) {
      $lastChild.remove();
    }
  }
})();

Goatools.Form.Goids.init();
