var Goatools = Goatools || {};

Goatools.Form = {
  $exampleGroup: $('#example-group'),

  init: function() {
    this.$exampleGroup.click(function(ev) {
      Goatools.Form.getExampleData(ev.target.parentElement.id);
    });
    $('#gos_file').change(function(ev) {
      Goatools.File.read(this.files[0], Goatools.File.Goids.parse)
    });
    $('#sections_file').change(function() {
      Goatools.File.read(this.files[0], Goatools.File.Sections.addName);
    });
  },

  getExampleData: function(id) {
    callServer('exampledata', {'type': id}).then(function(response) {
      var blob = Goatools.Form.createBlob(response.sections_data);
      console.log(blob);
      Goatools.File.read(blob, Goatools.Form.addExampleSectionsFile);
      Goatools.Form.addGoids(response.goids);
      Goatools.Form.addSectionsFileName(response.sections_name);
    });
  },

  addExampleSectionsFile: function(filename, contents) {
    // this.clearSectionsInput();
    // console.log(this);
    $('#blob_file').val(contents);

    // To refactor
    sectionsStringArray = contents.split('# SECTION: ');
    createTxtFileHtml(sectionsStringArray);
    document.getElementById('sections-view').disabled = false;
  },

  addGoids: function(goids) {
    $('#goids').val(goids);
  },

  addSectionsFileName: function(name) {
    $('#sections-file-name').text(name);
  },

  clearSectionsInput: function() {
    $('#sections_file').val(null);
  },

  createBlob: function(string) {
    var blob = new Blob([string], {type: 'text/plain'});
    return blob;
  }
}

Goatools.Form.init();


function addErrMsg(el, msg) {
  // select the element
  // append a div with msg after element
}
