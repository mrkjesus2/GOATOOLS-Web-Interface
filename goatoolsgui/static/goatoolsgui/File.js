'use strict'
var Goatools = Goatools || {};

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

        reader.onerror = function(e) {
          // console.log(e);
          window.alert('There was an error during the operation. \n' +
            'Please Try Again');
        };

        reader.onprogress = function(e) {
          console.log('Progress: ', e);
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
  }
}

Goatools.File.Goids = {
  isCorrectFormat: function(content) {
    var regex = /GO:\d*/gi;

    if (content.match(regex).length >= 0 && content.indexOf('SECTION:') === -1) {
      return true;
    }
    return false;
  },

  parse: function(filename, contents) {
    // Goatools.Form.goids =
    // TODO: Refactor this? can we set variables on form object?
    var goIds = document.getElementsByName('goids')[0];
    // Clear in case the file is changed
    goIds.value = '';

    if (this.Goids.isCorrectFormat(contents) && !this.Sections.isCorrectFormat(contents)) {
      var ids = contents.match(/GO:\d*/gi).join(', ');
      goIds.value = ids;
      return Goatools.Form.goidsVal = ids;
    } else {
      var errmsg = 'Please use a valid GOIDs file!';
      window.alert(errmsg);
    }
  }
}


Goatools.File.Sections = {
  get: function(sections) {
    var data = {
      'goids': $('#goids').val().replace(/ /g, ''),
      'sections': sections || ''
    }

    callServer('generatesections/', data).then(function(response) {
      console.log(response);
      // Add the response to the page
      // // Display sectionsfile
      sectionsStringArray = response.split('# SECTION: ');

      createTxtFileHtml(sectionsStringArray);

      // Remove disabled from view button
      document.getElementById('sections-view').disabled = false;

      Goatools.FileEditor.removeUnsavedWarning();
      Goatools.FileEditor.show();
    });
  },

  reset: function() {
    Goatools.FileEditor.removeUnsavedWarning();
    Goatools.FileEditor.hide();
    if (sectionsStringArray) {
      createTxtFileHtml(sectionsStringArray);
    }
  },

  update: function() {
    var $editor = $('#editor');
    var sections = {};

    if($editor.children().length > 0) {
      var $sections = $('.editor__section-container')

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

  isCorrectFormat: function(content) {
    if (content.indexOf('SECTION:') >= 0) {
      return true;
    }
    return false;
  },

  addName: function(name, contents) {
    // TODO: Refactor this? can we set variables on form object?
    if (this.Sections.isCorrectFormat(contents)) {
      // Clear example sections in case they exist
      document.getElementById('blob_file').value = null;
      var sectionsArray = contents.split('# SECTION:');
      $('#sections-view').disabled = false;
      createTxtFileHtml(sectionsArray);

      var el = document.getElementById('sections-file-name');
      el.innerHTML = name;
    } else {
      var errmsg = 'Please use a valid Sections file!';
      window.alert(errmsg);
    }
  }
}
