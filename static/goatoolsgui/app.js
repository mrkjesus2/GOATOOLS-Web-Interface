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
    console.log('flat GO file');
    var ids = fileContents.match(/GO:\d*/gi).join(', ');
    console.log(ids);
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
        console.log('Progress: ', e);
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