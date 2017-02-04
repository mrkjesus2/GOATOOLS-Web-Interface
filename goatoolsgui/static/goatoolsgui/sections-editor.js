var Goatools = Goatools || {};

function callServer(url, data) {
  var csrftoken = getCookie('csrftoken');
  var type = url === 'generatesections/' ? 'POST' : 'GET';

  return $.ajax({
    url: url,
    type: type,
    data: data,

    beforeSend: function(xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
    },

    success: function(response) {
      return response;
    },

    error: function(xhr, errmsg, err) {
      console.log('Ajax Error');
    }
  });
};

Goatools.FileEditor = {
  $sectionsInputs: $('.sections-file__group'),
  // $unsavedWarning: $('.unsaved-warning'),
  $openButton: $('#editor__open-button'),

  init: function() {
    console.log('Running Init');
    // this.$openButton.click(Goatools.SectionsFile.getFile());
  },

  show: function() {
    this.$sectionsInputs.eq(0).addClass('hidden');
    this.$sectionsInputs.eq(1).removeClass('hidden');
  },

  hide: function() {
    this.$sectionsInputs.eq(1).addClass('hidden');
    this.$sectionsInputs.eq(0).removeClass('hidden');
  },

  addUnsavedWarning: function() {
    this.$sectionsInputs.eq(1).addClass('panel-danger');
    // Ensure there is only one warning message
    if(document.getElementsByClassName('unsaved-warning').length === 0) {
      this.$sectionsInputs.eq(1).children().eq(0).append('<span class="unsaved-warning">You have unsaved changes</span>');
      this.$sectionsInputs.eq(1).children().eq(2).append('<span class="unsaved-warning">You have unsaved changes</span>');
    };
  },

  removeUnsavedWarning: function() {
    this.$sectionsInputs.eq(1).removeClass('panel-danger');
    $('.unsaved-warning').remove();
  },

  addSection: function() {

  },

  addFile: function(contents) {

  },

  createFileHtml: function() {

  }
}

Goatools.File = {
  read: function(file, type) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (file instanceof Blob || this.isValid(file)) {
        var reader = new FileReader();

        reader.onload = function(e) {
          var contents = e.target.result;

          Goatools.File.readHandler(file.name, contents, type);
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

  readHandler: function(filename, contents, type) {
    if (type === 'gos_file') {
      this.Goids.parse(contents);
    } else if (type === 'sections_file') {
      this.Sections.addName(filename, contents);
    } else if (type === 'blob_file') {
      Goatools.Form.addExampleSectionsFile(contents);
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

  parse: function(contents) {
    // TODO: Refactor this? can we set variables on form object?
    var goIds = document.getElementsByName('goids')[0];
    // Clear in case the file is changed
    goIds.value = '';
    console.log(this);
    if (this.isCorrectFormat(contents) && !Goatools.File.Sections.isCorrectFormat(contents)) {
      var ids = contents.match(/GO:\d*/gi).join(', ');
      goIds.value = ids.toString();
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
    if (this.isCorrectFormat(contents)) {
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
    '<span contenteditable="true">New section name</span>', 'section'
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
  console.log('Create File HTML');
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
 * Drag and Drop Handlers
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
function goidDragEnd(ev) {
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
  Goatools.FileEditor.addUnsavedWarning();
  console.timeEnd('Drop Over Handler');
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
    // console.log(ev.target);
  } else {
    // console.log('Left a section');
    // console.log("Left a line");
    ev.target.className = ev.target.className.replace(
      ' editor__goid-line--drag-over', ''
      );
  }
}
