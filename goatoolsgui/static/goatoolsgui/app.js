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

// TODO REMOVE: Here for fewer clicks
$(document).ready(function() {
  $('#goids').val('GO:0002376, GO:0002682, GO:0001817, GO:0001816, GO:0034097, GO:0045087, GO:0006954, GO:0002521, GO:0002467, GO:0007229, GO:0050900, GO:0022610, GO:0030155, GO:0007155, GO:0016032, GO:0050792, GO:0098542');
  $('#section_names').val('sections1, sections2');
  $('#dev-shortcut').click();
  // setTimeout(function() {
  //   $('#new-dev').click();
  // }, 1000);
});


/**
 * Makes an AJAX call to generatesections for Sections File Data
 * @param  {string} group    Name for the user's group
 * @param  {object} sections Contains section names with an array of related goids
 * @param  {array} goids    List of the user's goid's from initial form
 */
function getSectionsFile(group, sections, goids) {
  // TODO: Enforce GoId's are entered in form
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

    success: function(test) {
      console.log('Ajax Success');
      // Display sectionsfile
      var lines = divideTxtFileBySection(test);
      createTxtFileHtml(lines);
      // addSectionsToPage(test.list_2d);

      $('#editor-test').append(test);
      // Attach sections file
      // var sectionsFile = new Blob([test], {type : 'text/plain'});
      // var url = URL.createObjectURL(sectionsFile);
    },

    error: function(xhr, errmsg, err) {
      console.log("Failure");
      console.log(err);
    }
  });
};

/**
 * Takes data from the initial form or from the sections file editor and calls
 * getSectionsFile to make an AJAX request for Sections Data
 */
function updateSections() {
  var rootEl = document.getElementById('editor');
  var goids = $('#goids').val().replace(/ /g, '');
  var sections = {};
  var sectionNames;
  var group;

  if (rootEl.children.length === 0) {
    // Handle empty editor
    console.log('Editor is empty');

    group = $('#group_name').val() || 'gene-ontology';
    sectionNames = $('#section_names').val() || null;

    // Create section with empty goid array
    if (sectionNames) {
      sectionNames = sectionNames.replace(/,/g, '').split(' ');

      sectionNames.forEach(function(name) {
        sections[name] = ['GO:0002682'];
      });
      console.log(sections);
    }
  } else {
    // Handle edited information
    console.log('There is editor content');

    group = rootEl.getElementsByClassName('editor__group-name')[0].innerHTML.replace('# GROUP NAME: ', '');
    var sectionsEls = rootEl.getElementsByClassName('editor__section-container');

    console.log(sectionsEls);
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

  sections = JSON.stringify(sections);

  getSectionsFile(group, sections, goids);
}




/**
 * Sections File Editor
 */
function divideTxtFileBySection(file) {
  console.log('Divide Text File');
  var lines = file.split('# SECTION: ');
  return lines;
}

/**
 * Add a new section name to the sections file editor
 * @param {string} name The name of the user's new section for goids
 */
function addSectionName(el) {
  // Create a new section line with a default name
  var container = makeSectionContainer();
  var line = makeSectionLine('<span contenteditable="true">Your new name</span>');
  var target = document.getElementById('editor');

  container.id = 'default-section-name';
  container.append(line);
  target.insertBefore(container, target.children[1]);

  // Select the new section for easier editing
  // line.children[0].focus();
  selectEditableSection(line.children[0]);
  line.children[0].addEventListener('keydown', sectionNameListener);

  // Call blur() when enter or escape is pressed

  // selectEditableSection(input[0]);
}

function sectionNameListener(ev) {
  var cssValidRegex = /[~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;
  var container = ev.srcElement.parentElement.parentElement;

  container.id = ev.srcElement.innerText.replace(cssValidRegex, '');
  container.id = container.id.replace(/ /g, '-');
  console.log(ev, ev.keyCode);
  if (ev.keyCode === 13 || ev.keycode === 27) {
    ev.preventDefault();
    console.log(ev.srcElement.innerText);
    ev.srcElement.blur();
  }
}

/**
 * Use this if you want all the text highlighted
 */
function selectEditableSection(el) {
  var range = document.createRange();
  range.selectNodeContents(el);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function makeGroupLine(line) {
  var groupLine = document.createElement('div');
  groupLine.className = 'editor__group-name';
  groupLine.innerHTML = line;
  return groupLine;
}

function makeSectionContainer() {
  var container = document.createElement('div');

  container.className = 'editor__section-container';
  container.setAttribute('ondragover', 'dragover_handler(event, this)');
  container.setAttribute('ondrop', 'drop_handler(event, this)');
  container.setAttribute('ondragleave', 'container_drag_leave(event, this)');
  container.setAttribute('ondragenter', 'container_drag_enter(event, this)');

  return container;
}

function makeSectionLine(item) {
  var line = document.createElement('div');

  line.className = 'editor__section-line';
  line.innerHTML = '# SECTION: ' + item;
  line.setAttribute('ondragover', 'line_target_drag_over(event, this)');
  line.setAttribute('ondragleave', 'line_target_drag_leave(event, this)');

  return line;
}

function makeGoidLine(item) {
  var line = document.createElement('div');

  line.className = 'editor__goid-line';
  line.id = item.substr(0, 10);
  line.draggable = true;
  line.setAttribute('ondragstart', 'dragstart_handler(event)');
  line.setAttribute('ondragover', 'line_target_drag_over(event, this)');
  line.setAttribute('ondragleave', 'line_target_drag_leave(event, this)');
  line.innerHTML = item;

  return line
}

function createTxtFileHtml(lines) {
  // console.log('Create File HTML');
  var $el = $('#editor');

  // TODO: Clear before appending new data

  var fragment = document.createDocumentFragment();
  var sectionFragment = document.createDocumentFragment();
  var cssValidRegex = /[~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;

  lines.forEach(function(line) {
    if (line.includes('# GROUP')) {
      fragment.append(makeGroupLine(line));
    }
    else {
      var sectionLines = line.split('\n');
      var sectionContainer = makeSectionContainer();

      sectionLines.forEach(function(item) {
        if (!item.includes('GO:') && item.length > 0) {
          sectionContainer.id = item.replace(cssValidRegex, '');

          var sectionLine = makeSectionLine(item);

          sectionContainer.append(sectionLine);
        } else if (item.length > 0) {
          var goidLine = makeGoidLine(item);

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
function dragstart_handler(ev) {
  console.log('Drag Started');
  ev.dataTransfer.setData('text/plain', ev.target.id);
}

var timer;

function dragover_handler(ev, el) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = 'move';
  if (el.className.indexOf('editor__section-container--drag-over') === -1) {
    el.className += ' editor__section-container--drag-over';
  }

  // console.log('clientY:', ev.clientY, ' screenY:', ev.screenY,
  //   ' layerY:', ev.layerY, ' movementY:', ev.movementY, ' offsetY:', ev.offsetY,
  //   ' pageY:', ev.pageY, ' y:', ev.y, ' innerHeight:', window.innerHeight);

  // console.log(ev.timeStamp);
  if (!timer)
    timer = ev.timeStamp;
  else if (ev.timeStamp - 50 > timer) {
    timer = ev.timeStamp;
    scrollIfBoundary(ev.pageY);
  //   console.log('Do Something');
  }
  // console.log(timer);

    // requestAnimationFrame(function() {
    //   scrollIfBoundary(ev.pageY);
    // });
}

var height = window.innerHeight;
var modal = document.getElementById('editor-modal');

function scrollIfBoundary(position) {
  var buffer = 50;

  if (position < buffer) {
    console.log("Scrolling Up");
    modal.scrollTop -= 17;
  } else if (position > height - buffer) {
    console.log("Scrolling Down");
    modal.scrollTop += 17;
  }
}

function drop_handler(ev, el) {
  // TODO BUG: If there are duplicate GOID's it grabs the first one/not the dragged one
  ev.preventDefault();
  var id = ev.dataTransfer.getData('text');

  el.insertBefore(document.getElementById(id), ev.toElement.nextSibling);

  var target = ev.toElement;
  var targetParent = target.parentElement;

  target.className = target.className.replace(' editor__goid-line--drag-over', '');
  targetParent.className = targetParent.className.replace(' editor__section-container--drag-over', '');

  clearInterval(timer);
}

// Styles to be applied while dragging
function container_drag_enter(ev, el) {
  // console.log('Drage Enter');
}

function container_drag_leave(ev, el) {
  el.className = el.className.replace(' editor__section-container--drag-over', '');
}

function line_target_drag_over(ev, el) {
  // console.log('Drag Over Line');
  if (el.className.indexOf('editor__goid-line--drag-over') === -1) {
    el.className += ' editor__goid-line--drag-over';
  }
}

function line_target_drag_leave(ev, el) {
  // console.log('Drag Leave Line');
  el.className = el.className.replace(' editor__goid-line--drag-over', '');
}

/**
 * CSRF Token Methods
 */
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
