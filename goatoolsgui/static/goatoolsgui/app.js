/* global $ window document FileReader*/
/* eslint-disable no-alert */

// TODO: Refactor this function
// (No longer takes a section file, isValidTextFile may not need to be separate)
/**
 * [parseTxtFile description]
 * @param  {[type]} fileContents [description]
 */
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
 * onclick in forms.py
 * [readFile description]
 * @param  {[type]} files [description]
 */
function readFile(files) { // eslint-disable-line no-unused-vars
  document.getElementsByName('goids')[0].value = '';
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
        window.alert('The operation was aborted. \n' +
          'Please Try Again');
      };

      reader.onerror = function(e) {
        console.log(e);
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
 * onclick in forms.py
 * Called when a sections file is uploaded:
 * Puts the file name in the customized file uploader
 * @param {[type]} files [description]
 */
function addSectionsFile(files) { // eslint-disable-line no-unused-vars
  // TODO: Handle case where sections file is uploaded to gosid file input (vice-versa?)
  var file = files[0];
  if (isValidTextFile(file)) {
    var el = document.getElementById('sections-file-name');
    el.innerHTML = file.name;
  }
}

var sectionsStringArray;
/**
 * Makes an AJAX call to generatesections for Sections File Data
 * @param  {string} group    Name for the user's group
 * @param  {object} sections Contains section names with an array of related goids
 * @param  {array} goids    List of the user's goid's from initial form
 */
function getSectionsFile(group, sections, goids) {
  // AJAX call if there are goids present in the form
  if (goids) {
    console.log("Getting Sections Information");
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

      success: function(file) {
        // console.log('Ajax Success');
        // Display sectionsfile
        sectionsStringArray = file.split('# SECTION: ');
        createTxtFileHtml(sectionsStringArray);

        // Remove disable from view button
        document.getElementById('sections-view').disabled = false;

        // Attach sections file
        // var sectionsFile = new Blob([file], {type : 'text/plain'});
        // var url = URL.createObjectURL(sectionsFile);
      },

      error: function(xhr, errmsg, err) {
        console.log("Failure");
        console.log(err);
      }
    });
  } else {
    // Submit the form to raise validation error
    var submitButton = document.getElementById('form-submit');
    submitButton.click();
  }
}

/**
 * Use the previously fetched sectionStringArray to cancel user changes
 * @return {undefined}
 */
function resetSections() { // eslint-disable-line no-unused-vars
  createTxtFileHtml(sectionsStringArray);
}

/**
 * onclick in base_form.html
 * Takes data from the initial form or from the sections file editor and calls
 * getSectionsFile to make an AJAX request for Sections Data
 */
function updateSections() { // eslint-disable-line no-unused-vars
  var rootEl = document.getElementById('editor');
  var sections = {};
  // var sectionNames;
  var group;
  var goids = $('#goids').val();

  if (goids) {
    goids = goids.replace(/ /g, '');
  }

  if (rootEl.children.length === 0) {
    // Handle empty editor
    // console.log('Editor is empty');
    group = $('#group_name').val() || 'gene-ontology';
    // sectionNames = $('#section_names').val() || null;

  // Here in case I want a Section Names input on the form
    // Create section with empty goid array
    // if (sectionNames) {
    //   sectionNames = sectionNames.replace(/,/g, '').split(' ');

    //   sectionNames.forEach(function(name) {
    //     sections[name] = ['GO:0002682'];
    //   });
    // }
  } else {
    // Handle edited information
    group = rootEl.getElementsByClassName('editor__group-line')[0].innerHTML.replace('# GROUP NAME: ', '');
    var sectionsEls = rootEl.getElementsByClassName('editor__section-container');

    // Loop over each section to create a section object
    for (var i = 0; i < sectionsEls.length; i++) {
      var name = sectionsEls[i].id;
      var sectionGoids = [];

      // Skip the sections line and get the goids for the current section
      for (var j = 1; j < sectionsEls[name].children.length; j++) {
        sectionGoids.push(sectionsEls[name].children[j].id);
      }
      sections[name] = sectionGoids;
    }
  }

  if (Object.keys(sections).length !== 0) {
    sections = JSON.stringify(sections);
  }

  getSectionsFile(group, sections, goids);
  $('#editor-modal').modal('show');
}

/**
 * Sections File Editor
 * @param {string} file A string representing the sections.txt file
 * @return {array} An array of strings representing each section
 */
// function divideTxtFileBySection(file) {
//   // console.log('Divide Text File');
//   var lines = file.split('# SECTION: ');
//   return lines;
// }

/**
 * onclick in base_form.html
 * Add a new section name to the sections file editor
 */
function addSectionName() { // eslint-disable-line no-unused-vars
  // Create a new section line with a default name
  var target = document.getElementById('editor');
  var container = makeSectionContainer();
  var line = makeEditorLine(
    '<span contenteditable="true">Your new name</span>', 'section'
  );

  container.id = 'default-section-name';
  container.append(line);

  // Insert user's new section
  target.insertBefore(container, target.children[1]);

  // Select the new section automatically for easier editing
  selectEditableSection(line.children[0]);
  line.children[0].addEventListener('keydown', sectionNameListener);
}

/**
 * Handles keydown events on newly created sections
 * @param  {object} ev The keydown event
 * @return {undefined}
 */
function sectionNameListener(ev) {
  var cssValidRegex = /[~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;
  var container = ev.srcElement.parentElement.parentElement;

  container.id = ev.srcElement.innerText.replace(cssValidRegex, '');
  container.id = container.id.replace(/ /g, '-');

  if (ev.keyCode === 13 || ev.keycode === 27) {
    ev.preventDefault();
    ev.srcElement.blur();
  }
}

/**
 * Highlights editable text in passed element
 * @param {HTMLElement} el Element to select for editing
 */
function selectEditableSection(el) {
  var range = document.createRange();
  range.selectNodeContents(el);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Create a container element for a section
 * @param  {string} line The section name
 * @return {HTMLElement}      Container div
 */
function makeSectionContainer(line) {
  var container = document.createElement('div');
  var cssValidRegex = /[~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;

  if (line) {
    container.id = line.replace(cssValidRegex, '');
  }
  container.className = 'editor__section-container';
  container.setAttribute('ondrop', 'sectionDropOver(event, this)');

  return container;
}

/**
 * Create an element for an Editor line
 * @param  {string} item The line text
 * @param  {string} type Type of line that is created 'group', 'section', 'goid'
 * @return {HTMLElement}      The line that is created
 */
function makeEditorLine(item, type) {
  var line = document.createElement('div');
  var lineClass = 'editor__' + type + '-line';
  var lineText = item;

  if (type === 'section') {
    lineText = '# SECTION: ' + item;
  }

  if (type === 'goid') {
    line.id = item.substr(0, 10);
    line.draggable = true;
    line.addEventListener('dragstart', goidDragStart, false);
    line.addEventListener('dragend', goidDragEnd, false);
  }

  line.className = lineClass;
  line.innerHTML = lineText;

  return line;
}

/**
 * Creates HTML representation of the array created from sections.txt
 * @param  {array} sectionsArray Array of strings representing the .txt file
 * @return {undefined}
 */
function createTxtFileHtml(sectionsArray) {
  // console.log('Create File HTML');
  var el = document.getElementById('editor');
  var fragment = document.createDocumentFragment();
  var sectionFragment = document.createDocumentFragment();

  // Clear previous information
  el.innerHTML = '';

  // Create the new file information
  sectionsArray.forEach(function(section) {
    if (section.includes('# GROUP')) {
      // Append GROUP NAME line
      fragment.append(makeEditorLine(section, 'group'));
    } else {
      // Create section container and child lines
      var sectionLines = section.split('\n');
      var sectionContainer;

      sectionLines.forEach(function(line) {
        if (!line.includes('GO:') && line.length > 0) {
          // Make container
          sectionContainer = makeSectionContainer(line);

          // Make section name line and append to section container
          var sectionLine = makeEditorLine(line, 'section');
          sectionContainer.append(sectionLine);
        } else if (line.length > 0) {
          // Make and append goid line
          var goidLine = makeEditorLine(line, 'goid');
          sectionContainer.append(goidLine);
        }
      });
      sectionFragment.append(sectionContainer);
    }
    fragment.append(sectionFragment);
  });
  el.append(fragment);
}

/*
* Trying HTML drag and drop
*/

// Variables needed for scroll function
var scrollId = 0;
var stopScroll = true;
var cursor; // Set by goid line drag handler
var modal = document.getElementById('editor-modal'); // Query once, improve performmance
var height = window.innerHeight; // Query once, improve performance

/**
 * Allow scroll while dragging lines
 * @param  { num } timestamp  Return id from requestAnimationFrame
 * @return { undefined }
 */
function scroll() {
  var scrollY = modal.scrollTop;

  if (cursor < 50) {
    modal.scrollTop = scrollY - 10;
  } else if (cursor > height - 50) {
    modal.scrollTop = scrollY + 10;
  } else if (cursor < 150) {
    modal.scrollTop = scrollY - 5;
  } else if (cursor > height - 150) {
    modal.scrollTop = scrollY + 5;
  }

  if (!stopScroll) {
    scrollId = window.requestAnimationFrame(scroll);
  }
}

/**
 * Goid Line Drag Handlers
 */

/**
 * Handle the event fired when dragging starts
 * @param  {object} ev The event object
 * @return {undefined}
 */
function goidDragStart(ev) {
  // Add event listeners to 'editor__section-container'
  var containers = document.getElementsByClassName('editor__section-container');

  for (var i = 0; i < containers.length; i++) {
    var container = containers[i];

    container.addEventListener('dragenter', sectionDragEnter, false);
    container.addEventListener('dragleave', sectionDragLeave, false);
    container.addEventListener('dragover', sectionDragOver, false);
  }

  // Set the data to be transferred by dragging
  ev.dataTransfer.setData('text/plain', ev.target.id);

  // Allow the modal content to scroll while dragging
  stopScroll = false;
  scrollId = window.requestAnimationFrame(scroll);
}

/**
 * Handle the event fired when dragging ends
 * @param  {object} ev The event object
 * @return {undefined}
 */
function goidDragEnd() {
  var containers = document.getElementsByClassName('editor__section-container');

  // Unbind event listeners when not dragging
  for (var i = 0; i < containers.length; i++) {
    var container = containers[i];

    container.removeEventListener('dragenter', sectionDragEnter, false);
    container.removeEventListener('dragleave', sectionDragLeave, false);
    container.removeEventListener('dragover', sectionDragOver, false);
  }
  // End the scrolling loop
  cursor = null;
  stopScroll = true;
  window.cancelAnimationFrame(scroll);
}

/**
 * Section Drag Handlers
 */

/**
 * Handle the dragover event fired while over 'editor__section-container'
 * @param  {event} ev The event object
 * @param  {HTMLElement} el The element that fired the event
 * @return {undefined}
 */
function sectionDragOver(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = 'move';

  // Update the cursor position for the scroll loop
  cursor = ev.pageY;
}

/**
 * Handle the event fired when a line is dropped on 'editor__section-container'
 * @param  {object} ev The event object
 * @param  {HTMLElement} el The element that fired the event
 * @return {undefined}
 */
function sectionDropOver(ev, el) { // eslint-disable-line no-unused-vars
  console.time('Drop Over Handler');
  // TODO BUG: If there are duplicate GOID's it grabs the first one/not the dragged one
  ev.preventDefault();
  var id = ev.dataTransfer.getData('text');

  el.insertBefore(document.getElementById(id), ev.toElement.nextSibling);

  var target = ev.toElement;
  var targetParent = target.parentElement;

  target.className = target.className.replace(' editor__goid-line--drag-over', '');
  targetParent.className = targetParent.className.replace(' editor__section-container--drag-over', '');

  // Stop the scroll loop used while dragging
  stopScroll = true;
  window.cancelAnimationFrame(scrollId);
  console.timeEnd('Drop Over Hanler');
}

/**
 * Handle the event fired when entering a 'editor__section-container' element
 * @param  {object} ev The event object
 * @param  {HTMLElement} el The element that fired the event
 * @return {undefined}
 */
function sectionDragEnter(ev) {
  ev.preventDefault();
  // if (el.className.indexOf('editor__section-container--drag-over') === -1) {
  //   el.className += ' editor__section-container--drag-over';
  // }

  if (ev.target !== this) {
    // Add goid line classname if it doesn't exist
    if (ev.target.className.indexOf('editor__goid-line--drag-over') === -1) {
      ev.target.className += ' editor__goid-line--drag-over';
    }
  } else {
    // Add classname if it doesn't exist
  }
}

/**
 * Handle the event fired when leaving a 'editor__section-container' element
 * @param  {objec} ev The event object
 * @param  {HTMLElement} el The element that fired the event
 * @return {undefined}
 */
function sectionDragLeave(ev) {
  if (ev.target === this) {
    ev.target.className = ev.target.className.replace(
      ' editor__section-container--drag-over', ''
    );
    console.log(ev.target);
  } else {
    console.log('Left a section');
    console.log("Left a line");
    ev.target.className = ev.target.className.replace(
      ' editor__goid-line--drag-over', ''
      );
  }
}

/**
 * CSRF Token Methods
 */

/**
 * Method from https://docs.djangoproject.com/en/dev/ref/csrf/ for AJAX calls
 * @param  {[type]} method [description]
 * @return {[type]}        [description]
 */
function csrfSafeMethod(method) {
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

/**
 * Method from https://docs.djangoproject.com/en/dev/ref/csrf/ for AJAX calls
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = $.trim(cookies[i]);
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

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
$('#InformationModal').on('hidden.bs.modal', function() {
  $('#InformationModal.modal-info').addClass('hidden');
});

// Add fixedHeaderTable.js
var hdrHeight = $('header').height();
var ftrHeight = $('footer').height();
var lnkHeight = $('.results-links').outerHeight();
var wndwHeight = window.innerHeight;
// var wndwWidth = window.innerWidth;

$(document).ready(function() {
  var height = wndwHeight - hdrHeight - ftrHeight - lnkHeight;
  $('#results-table').fixedHeaderTable({
    // width: 300,
    height: height,
    autoresize: true
  });
});

/**
 * Development Helpers
 * TODO: Remove these when ready
 */

$(document).ready(function() {
  // eslint-disable-next-line max-len
  // $('#goids').val('GO:0002376, GO:0002682, GO:0001817, GO:0001816, GO:0034097, GO:0045087, GO:0006954, GO:0002521, GO:0002467, GO:0007229, GO:0050900, GO:0022610, GO:0030155, GO:0007155, GO:0016032, GO:0050792, GO:0098542');
//   $('#section_names').val('sections1, sections2');
  // $('#dev-shortcut').click();
  // var timer = setInterval(function() {
  //   $('#dev-shortcut').click();
  // }, 500);

  // setTimeout(function() {
  //   clearInterval(timer);
  // }, 2250);
});
