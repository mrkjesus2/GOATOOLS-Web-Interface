/* global window document FileReader*/

function goIdsToArray() {
  // Convert a series of GoIds to an array
}

function callServer() {
  // Make an AJAX call to the server with GO Ids
}

/**
 * [parseTxtFile description]
 * @param  {[type]} fileContents [description]
 */
// TODO: Refactor this function
// (No longer takes a section file, isValidTextFile may not need to be separate)
function parseTxtFile(fileContents) {
  var goIds = document.getElementsByName('goids')[0];
  // Clear in case the file is changed
  goIds.value = '';

  if (fileContents.indexOf('SECTION:') >= 0) {
    console.log('section file');
    // Find the sections
      // Populate a sections input
      // Find GOids associated with section
    // Or do I just send the file to the server?
  } else {
    var ids = fileContents.match(/GO:\d*/gi).join(', ');
    goIds.value = ids.toString();
  }
}

/*
* Takes a file and checks that it is a text/* file
 */
function isValidTextFile(file) {
  var extension = file.name.substr(file.name.lastIndexOf('.')+1);
  if (!file) {
    alert("The file failed to load");
  } else if (extension === 'txt' || extension === 'tsv') {
    return true;
  } else {
    alert(file.name + " is not a valid text file.");
    // TODO: Clear the file field
  }
}

/**
 * [readFile description]
 * @param  {[type]} files [description]
 */
function readFile(files) {
  clearForm();
  var file = files[0];

  // Check for FileReader support
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    if (isValidTextFile(file)) {
      var reader = new FileReader();

      reader.onload = function(e) {
        var contents = e.target.result;
        // console.log(contents);
        parseTxtFile(contents);
      };

      reader.onabort = function() {
        alert('The operation was aborted. \n' +
          'Please Try Again');
      };

      reader.onerror = function(e) {
        console.log(e);
        alert('There was an error during the operation. \n' +
          'Please Try Again');
      };

      reader.onprogress = function(e) {
        // console.log('Progress: ', e);
      };

      reader.readAsText(file);
    }
  } else {
    alert('The file APIs are not fully supported by your browser');
  }
}

/**
 * [clearForm description]
 */
function clearForm() {
  document.getElementsByName('goids')[0].value = '';
  // document.getElementsByName('headerids')[0].value = ''; Here incase header input is necessary
  // document.getElementsByName('filename')[0].value = '';
}

/**
 * Called when a sections file is uploaded:
 * Puts the file name in the customized file uploader
 * @param {[type]} file [description]
 */
function addFileName(files) {
  var file = files[0];
  var el = document.getElementById('sections-file-name');
  el.innerHTML = file.name;
}

// TODO: Handle case where sections file is uploaded to gosid file input (vice-versa?)

// Enable tooltips in bootstrap
$(function() {
  $('[data-toggle="tooltip"]').tooltip({
    trigger: 'hover'
  });
});

// Show correct info when modal opens
$('#InformationModal').on('show.bs.modal', function(event) {
  var targets = $('.modal-' + event.relatedTarget.id);
  targets.removeClass('hidden');
});

// Hide info when modal closes - prevents too much info in next modal
$('#InformationModal').on('hidden.bs.modal', function(event) {
  $('.modal-info').addClass('hidden');
});

// Add fixedHeaderTable.js
var hdrHeight = $('header').height();
var ftrHeight = $('footer').height();
var lnkHeight = $('.results-links').outerHeight();
var wndwHeight = window.innerHeight;
var wndwWidth = window.innerWidth;

$(document).ready(function() {
  var height = wndwHeight - hdrHeight - ftrHeight - lnkHeight;
  $('#results-table').fixedHeaderTable({
    // width: 300,
    height: height,
    autoresize: true
  });
});

function getSectionsFile() {
  // TODO: Enforce GoId's are entered in form
  var goids = $('#goids').val().replace(/ /g, '');
  var group = $('#group_name').val() || 'gene-ontology';
  var sections = {};
  var sectionNames = $('#section_names').val() || null;

  if (sectionNames) {
    sectionNames = sectionNames.replace(/,/g, '').split(' ');
    sectionNames.forEach(function(name) {
      sections[name] = ['GO:0002376', 'GO:0002682'];
    });
    sections = JSON.stringify(sections);
  } else {
    console.log('Sections not split');
  }

  // console.log(sections);
  // console.log(typeof(sections));
  var csrftoken = getCookie('csrftoken');

  $.ajax({
    url: "generatesections/",
    type: "POST",
    data: {
      'goids': goids,
      'group-name': group,
      'sections': sections
    },

    beforeSend: function(xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
    },

    success: function(test) {
      // Display sectionsfile
      var lines = divideTxtFileBySection(test);
      createTxtFileHtml(lines);
      // addSectionsToPage(test.list_2d);


      // Attach sections file
      var sectionsFile = new Blob([test], {type : 'text/plain'});
      var url = URL.createObjectURL(sectionsFile);
    },

    error: function(xhr, errmsg, err) {
      console.log("Failure");
      console.log(err);
    }
  });
};

$(document).ready(function() {
  $('#goids').val('GO:0002376, GO:0002682, GO:0001817, GO:0001816, GO:0034097, GO:0045087, GO:0006954, GO:0002521, GO:0002467, GO:0007229, GO:0050900, GO:0022610, GO:0030155, GO:0007155, GO:0016032, GO:0050792, GO:0098542');
  $('#section_names').val('sections1, sections2');
});

// https://docs.djangoproject.com/en/dev/ref/csrf/
function csrfSafeMethod(method) {
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function addSectionsToPage(sections) {
  var $el = $('#editor');
  sections.forEach(function(section) {
    console.log(section[0]);
    // Add section line
    var list = $el.append('<ul>');
    list.append('<li>{Find appropriate text}' + section[0] + '</li>');

    // Add goid information line
    section[1].forEach(function(goid) {
      list.append('<li>' + goid + '</li>');
      console.log(goid);
    });
    list.append('</ul>');
  });
}

function divideTxtFileBySection(file) {
  var lines = file.split('# SECTION: ');
  return lines;
}

function createTxtFileHtml(lines) {
  var $el = $('#editor');
  var fragment = document.createDocumentFragment();
  var sectionFragment = document.createDocumentFragment();
  var cssValidRegex = /[~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;

  lines.forEach(function(line) {
    if (line.includes('# GROUP')) {
      var groupLine = document.createElement('div');
      groupLine.className = 'editor__group-name';
      groupLine.innerHTML = line;

      fragment.append(groupLine);
    }
    else {
      var sectionLines = line.split('\n');
      // var goidContainer = '<div id="%replace%" class="section-goids"></div>';
      var sectionContainer = document.createElement('div');

      // Trying drag and drop
      sectionContainer.setAttribute("ondragover", "dragover_handler(event)");
      sectionContainer.setAttribute("ondrop", "drop_handler(event)");

      sectionLines.forEach(function(item) {
        if (!item.includes('GO:') && item.length > 0) {
          sectionContainer.className = 'editor__section-container';
          sectionContainer.id = item.replace(cssValidRegex, '');

          var sectionLine = document.createElement('div');
          sectionLine.className = 'editor__section-line';
          sectionLine.innerHTML = '# SECTION: ' + item;

          sectionContainer.append(sectionLine);
        } else if (item.length > 0) {
          var goidLine = document.createElement('div');
          goidLine.className = 'editor__goid-line';
          goidLine.id = item.substr(0, 9);
          goidLine.draggable = true;
          goidLine.innerHTML = item;

          sectionContainer.append(goidLine);
        }
      });
      sectionFragment.append(sectionContainer);
    }
    fragment.append(sectionFragment);
  });
  $el.append(fragment);
}

/*
* Trying HTML drag and drop
*/
function dragover_handler(ev) {
  console.log("Dragged over element");
}

function drop_handler(ev) {
  console.log("Dropped on element");
}
