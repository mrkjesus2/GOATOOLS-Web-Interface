var Goatools = Goatools || {};
/**
 * Adds the 'goids' from fileContents to the form input
 * @param  {string} fileContents Contents fo the fileContents
 */
function parseGoidsFile(fileContents) {
  var goIds = document.getElementsByName('goids')[0];
  // Clear in case the file is changed
  goIds.value = '';

  if (isGoidsFile(fileContents) && !isSectionsFile(fileContents)) {
    var ids = fileContents.match(/GO:\d*/gi).join(', ');
    goIds.value = ids.toString();
  } else {
    var errmsg = 'Please use a valid GOIDs file!';
    window.alert(errmsg);
  }
}

/**
 * Adds a sections file to the form input when called by readFileHandler
 * @param {string} filename     The name of the file
 * @param {string} fileContents Used to check that it is in fact a 'sections file'
 */
function addSectionsFileName(filename, fileContents) { // eslint-disable-line no-unused-vars
  if (isSectionsFile(fileContents)) {
    // Clear example sections in case they exist
    document.getElementById('blob_file').value = null;

    var sectionsArray = fileContents.split('# SECTION:');
    createTxtFileHtml(sectionsArray);
    $('#sections-view').disabled = false;

    var el = document.getElementById('sections-file-name');
    el.innerHTML = filename;
  } else {
    var errmsg = 'Please use a valid Sections file!';
    window.alert(errmsg);
  }
}

/**
 * Check that a file is a 'goids file'
 * @param  {string}  content The contents of the file to Check
 * @return {Boolean}          True means yes it is
 */
function isGoidsFile(content) {
  var regex = /GO:\d*/gi;

  if (content.match(regex).length >= 0 && content.indexOf('SECTION:') === -1) {
    return true;
  }
  return false;
}

/**
 * Check that a file is a 'sections file'
 * @param  {string}  content The contents of the file to Check
 * @return {Boolean}          True means yes it is
 */
function isSectionsFile(content) {
  if (content.indexOf('SECTION:') >= 0) {
    return true;
  }
  return false;
}

/**
 * Check that a file is a valid .txt file
 * @param  {object}  file File object
 * @return {Boolean} True for valid file
 */
function isValidTextFile(file) {
  var extension = file.name.substr(file.name.lastIndexOf('.') + 1);
  if (!file) {
    window.alert("The file failed to load");
  } else if (extension === 'txt' || extension === 'tsv') {
    return true;
  } else {
    window.alert(file.name + " is not a valid text file.");
  }
}

/**
 * Read a file and call readFileHandler() with the contents and type of file
 * @param  {File} file The file to readFile
 * @param  {string} type Determines if it's a 'goids' or 'sections' file
 */
function readFile(file, type) { // eslint-disable-line no-unused-vars
  // Check for FileReader support
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    if (file instanceof Blob || isValidTextFile(file)) {
      var reader = new FileReader();

      reader.onload = function(e) {
        var contents = e.target.result;

        readFileHandler(file.name, contents, type);
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
}

/**
 * Handler call by readFile 'onload' event
 * @param  {string} filename Name of the file that was readFile
 * @param  {string} contents Contents of the file that was read
 * @param  {string} type     Type of the file that is expected
 */
function readFileHandler(filename, contents, type) {
  if (type === 'gos_file') {
    parseGoidsFile(contents);
  } else if (type === 'sections_file') {
    addSectionsFileName(filename, contents);
  } else if (type === 'blob_file') {
    Goatools.Form.addExampleSectionsFile(contents);
  }
}

/**
 * Called when the user clicks on a dropdown of 'Try an Example' button - adds
 * file content to a hidden input for use on the backend
 * @param  {HTMLElement} el The element that was clicked
 */
// var sectionsStringArray;
// function getExampleData(el) { // eslint-disable-line no-unused-vars
//   console.log("Let's get the example data, huh?");
//   console.log(el.id);
//   $.ajax({
//     url: 'exampledata',
//     type: 'GET',
//     data: {
//       type: el.id
//     },
//
//     success: function(response) {
//       // Clear any sections file so the backend uses blob data
//       // document.getElementById('sections_file').value = null;
//
//       // var blob = new Blob([response.sections_data], {type: 'text/plain'}); // eslint-disable-line no-undef
//
//       // var reader = new FileReader();
//       reader.addEventListener('loadend', function() {
//         var data = reader.result;
//         document.getElementById('blob_file').value = data;
//         document.getElementById('goids').value = response.goids;
//         document.getElementById('sections-file-name').innerText = response.sections_name;
//
//         sectionsStringArray = data.split('# SECTION: ');
//         createTxtFileHtml(sectionsStringArray);
//
//         // Remove disable from view button
//         document.getElementById('sections-view').disabled = false;
//       });
//       // console.log(reader.readAsArrayBuffer(blob));
//       // reader.readAsText(blob);
//     },
//
//     error: function() {
//       console.log('getExampleData encountered an error');
//     }
//   });
// }

/**
 * Makes an AJAX call to generatesections for Sections File Data
 * @param  {string} group    Name for the user's group
 * @param  {object} sections Contains section names with an array of related goids
 * @param  {array} goids    List of the user's goid's from initial form
 */
// function getSectionsFile(goids, group, sections, cb) {
//   // AJAX call if there are goids present in the form
//   if (goids) {
//     // console.log("Getting Sections Information");
//     var csrftoken = getCookie('csrftoken');
//     // console.log(sections);
//     $.ajax({
//       url: "generatesections/",
//       type: "POST",
//       data: {
//         'goids': goids,
//         'group-name': group,
//         'sections': sections
//       },
//
//       beforeSend: function(xhr, settings) {
//         if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
//           xhr.setRequestHeader("X-CSRFToken", csrftoken);
//         }
//       },
//
//       success: function(file) {
//         var $el = $('.sections-file__group');
//         console.log('Ajax Success');
//         // console.log(file);
//         // Display sectionsfile
//         sectionsStringArray = file.split('# SECTION: ');
//
//         createTxtFileHtml(sectionsStringArray);
//
//         // Remove disabled from view button
//         document.getElementById('sections-view').disabled = false;
//
//         Goatools.FileEditor.removeUnsavedWarning();
//         Goatools.FileEditor.show();
//
//         // Callback for jasmine tests
//         if (cb) {
//           cb();
//         }
//         // Attach sections file
//         // var sectionsFile = new Blob([file], {type : 'text/plain'});
//         // var url = URL.createObjectURL(sectionsFile);
//       },
//
//       error: function(xhr, errmsg, err) {
//         console.log("Failure");
//         console.log(err);
//
//         // Callback for jasmine tests
//         if(cb) {
//           cb();
//         }
//       }
//     });
//   } else {
//     // Submit the form to raise validation error
//     var submitButton = document.getElementById('form-submit');
//     submitButton.click();
//   }
// }

// /**
//  * Use the previously fetched sectionStringArray to cancel user changes
//  * @return {undefined}
//  */
// function resetSections() { // eslint-disable-line no-unused-vars
//   // console.log('Resetting the sections');
//   Goatools.FileEditor.hide();
//   if (sectionsStringArray) {
//     createTxtFileHtml(sectionsStringArray);
//   }
// }

/**
 * onclick in base_form.html
 * Takes data from the initial form or from the sections file editor and calls
 * getSectionsFile to make an AJAX request for Sections Data
 */
// function updateSections(cb) { // eslint-disable-line no-unused-vars
//   var rootEl = document.getElementById('editor');
//   var sections = {};
//   // var sectionNames;
//   var group;
//   var goids = $('#goids').val();
//
//   if (goids) {
//     goids = goids.replace(/ /g, '');
//   }
//
//   if (rootEl.children.length === 0) {
//     // Handle empty editor
//     // console.log('Editor is empty');
//     group = $('#group_name').val() || 'gene-ontology';
//     // sectionNames = $('#section_names').val() || null;
//
//   // Here in case I want a Section Names input on the form
//     // Create section with empty goid array
//     // if (sectionNames) {
//     //   sectionNames = sectionNames.replace(/,/g, '').split(' ');
//
//     //   sectionNames.forEach(function(name) {
//     //     sections[name] = ['GO:0002682'];
//     //   });
//     // }
//   } else {
//     // Handle edited information
//     group = rootEl.getElementsByClassName('editor__group-line')[0].innerHTML.replace('# GROUP NAME: ', '');
//     var sectionsEls = rootEl.getElementsByClassName('editor__section-container');
//
//     // Loop over each section to create a section object
//     for (var i = 0; i < sectionsEls.length; i++) {
//       var name = sectionsEls[i].id;
//       var sectionGoids = [];
//
//       // Skip the sections line and get the goids for the current section
//       for (var j = 1; j < sectionsEls[name].children.length; j++) {
//         sectionGoids.push(sectionsEls[name].children[j].id);
//       }
//       sections[name] = sectionGoids;
//     }
//   }
//   console.log(sections);
//   if (Object.keys(sections).length !== 0) {
//     sections = JSON.stringify(sections);
//   }
//   console.log(sections);
//   // cb is used for jasmine tests - wait for async to finish before evaluating expectations
//   if(cb) {
//     getSectionsFile(goids, group, sections, cb);
//   } else {
//     getSectionsFile(goids, group, sections);
//   }
// }

function addErrMsg(el, msg) {
  // select the element
  // append a div with msg after element
}
