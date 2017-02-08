/* global $ window Blob Form FileReader callServer Goids Sections*/
'use strict';
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
          Form.addError('The operation was aborted. Please Try Again');
        };

        reader.onerror = function() {
          // console.log(e);
          Form.addError('There was an error during the operation. ' +
            'Please Try Again');
        };

        reader.onprogress = function() {
          // console.log('Progress: ', e);
        };

        reader.readAsText(file);
      }
    } else {
      Form.addError('The file APIs are not fully supported by your browser.' +
        'This site may not work as expected');
    }
  },

  isValid: function(file) {
    var extension = file.name.substr(file.name.lastIndexOf('.') + 1);
    if (!file) {
      Form.addError("The file failed to load. Give it another try");
    } else if (extension === 'txt' || extension === 'tsv') {
      return true;
    } else {
      Form.addError(file.name + " is not a valid text file.");
    }
  },

  getExampleData: function(id) {
    callServer('exampledata/', {'type': id}).then(function(response) {
      var blob = Goatools.File.createBlob(response.sections_data);
      var isBlob = true;

      function setData(filename, contents) {
        Sections.setSections(response.sections_name, contents, isBlob);
        Goids.setGoids(response.goids);
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
      Goids.setGoids(ids);
    } else {
      Form.addError('Please use a valid GOIDs file!');
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
    if (this.Sections.isValidType(contents)) {
      Sections.setSections(name, contents);
    } else {
      Form.addError('Please use a valid Sections file!');
    }
  }
};
