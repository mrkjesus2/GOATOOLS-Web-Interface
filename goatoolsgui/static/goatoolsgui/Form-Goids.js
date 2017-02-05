var Goids = (function() {
  'use strict';

  var Module = {
    els: {
      input: $('#goids'),
      fileInput: $('#gos_file'),
      examples: $('#example-group')
    },

    init: function() {
      this.els.fileInput.on('change', onFileChange.bind(this));
      this.els.examples.on('click', onExampleClick.bind(this));
    },

    display: function() {
      this.els.input.val(this.goids);
    },

    setGoids: function(ids) {
      this.goids = ids;
      this.display();
    }
  };
  return Module;

  function onFileChange(ev) {
    Goatools.File.read(ev.target.files[0], Goatools.File.Goids.parse);
  }

  function onExampleClick(ev) {
    Goatools.File.getExampleData(ev.target.parentElement.id);
  }
}());
