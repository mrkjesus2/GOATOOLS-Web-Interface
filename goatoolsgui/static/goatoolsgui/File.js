'use strict';
/* global $ Goatools window document Blob Form FileReader callServer sectionsStringArray createTxtFileHtml */
var Goatools = Goatools || {}; // eslint-disable-line

Goatools.File = {
  read: function(file, cb) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (file instanceof Blob || this.isValid(file)) {
        var reader = new FileReader();

        reader.onload = function(e) {
          var contents = e.target.result;
          cb.call(Goatools.File, file.name, contents);
        };

        reader.onabort = function() {
          window.alert('The operation was aborted. \n' +
            'Please Try Again');
        };

        reader.onerror = function() {
          // console.log(e);
          window.alert('There was an error during the operation. \n' +
            'Please Try Again');
        };

        reader.onprogress = function(e) {
          // console.log('Progress: ', e);
        };

        reader.readAsText(file);
      }
    } else {
      window.alert('The file APIs are not fully supported by your browser');
    }
  },

  isValid: function(file) {
    var extension = file.name.substr(file.name.lastIndexOf('.') + 1);
    if (!file) {
      window.alert("The file failed to load");
    } else if (extension === 'txt' || extension === 'tsv') {
      return true;
    } else {
      window.alert(file.name + " is not a valid text file.");
    }
  },

  getExampleData: function(id) {
    callServer('exampledata', {type: id}).then(function(response) {
      var blob = Goatools.File.createBlob(response.sections_data);
      var isBlob = true;

      function setData(filename, contents) {
        Form.setSections(response.sections_name, contents, isBlob);
        Form.setGoids(response.goids);
      }

      Goatools.File.read(blob, setData);
    });
  },

  createBlob: function(string) {
    var blob = new Blob([string], {type: 'text/plain'});
    return blob;
  }
};

Goatools.File.Goids = {
  isValidType: function(content) {
    var regx = /GO:\d*/gi;

    if (content.match(regx).length >= 0 && content.indexOf('SECTION:') === -1) {
      return true;
    }
    return false;
  },

  parse: function(filename, cont) {
    if (this.Goids.isValidType(cont) && !this.Sections.isValidType(cont)) {
      var ids = cont.match(/GO:\d*/gi).join(', ');
      Form.setGoids(ids);
    } else {
      var errmsg = 'Please use a valid GOIDs file!';
      window.alert(errmsg);
    }
  }
};


Goatools.File.Sections = {
  get: function(sections) {
    var data = {
      goids: $('#goids').val().replace(/ /g, ''),
      sections: sections || ''
    };

    callServer('generatesections/', data)
      .then(function(response) {
        Sections.setSections('generated-sections-file.txt', response);
    });
  },

  reset: function() {
    Form.setSections();
  },

  update: function() {
    var $editor = $('#editor');
    var sections = {};

    if ($editor.children().length > 0) {
      var $sections = $('.editor__section-container');

      // Loop over each section
      $sections.each(function(i) {
        var sectionName = $sections[i].id;
        var sectionGoids = [];

        // Loop over the sections children and add goids to array - sections[0] is not a goid
        for (var j = 1; j < $sections[i].children.length; j++) {
          sectionGoids.push($sections[i].children[j].id);
        }

        sections[sectionName] = sectionGoids;
      });

      this.get(JSON.stringify(sections));
    }
  },

  isValidType: function(content) {
    if (content.indexOf('SECTION:') >= 0) {
      return true;
    }
    return false;
  },

  addName: function(name, contents) {
    // TODO: Refactor this? can we set variables on form object?
    if (this.Sections.isValidType(contents)) {
      // var sectionsArray = contents.split('# SECTION:');
      // createTxtFileHtml(sectionsArray);

      Sections.setSections(name, contents);
    } else {
      var errmsg = 'Please use a valid Sections file!';
      window.alert(errmsg);
    }
  }
};
