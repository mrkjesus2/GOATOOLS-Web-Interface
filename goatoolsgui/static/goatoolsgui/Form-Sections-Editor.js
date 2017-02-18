/* global document window $ */
var Goatools = Goatools || {};
Goatools.Form = Goatools.Form || {};
Goatools.Form.Sections = Goatools.Form.Sections || {};

(function() {
  'use strict';
  var sectsModule = Goatools.Form.Sections;

  Goatools.Form.Sections.Editor = {
    els: {
      openBtn: $('#editor__open-button'),
      saveBtn: $('.editor__save-btn'),
      closeBtns: $('.close'),
      panels: $('.panel-heading'),
      container: $('.panel'),
      addSectionBtn: $('#editor__add-section'),
      file: $('#editor__file')
    },

    init: function() {
      this.els.saveBtn.on('click', onSave.bind(this));
      this.els.closeBtns.on('click', onClose.bind(this));
      this.els.openBtn.on('click', onOpenBtnClick.bind(this));
      this.els.addSectionBtn.on('click', addNewSection.bind(this));
    },

    show: function() {
      sectsModule.els.sectionsGroups.eq(0).addClass('hidden');
      sectsModule.els.sectionsGroups.eq(1).removeClass('hidden');

      // Change the openBtn when called programatically
      if (this.els.openBtn.text().trim() === 'Generate') {
        changeBtn.bind(this)();
      }
    },

    hide: function() {
      sectsModule.els.sectionsGroups.eq(1).addClass('hidden');
      sectsModule.els.sectionsGroups.eq(0).removeClass('hidden');
    },

    reset: function() {
      this.hide();
      resetOpenBtn.bind(this)();
      $('#editor').children().remove();
    },

    addWarning: function() {
      var warningEl = $('<span/>', {
        class: 'unsaved-warning',
        text: 'You have unsaved changes'
      });

      this.els.container.addClass('panel-danger');

      // Check for warning message, add if none
      if ($('.unsaved-warning', this.els.panels).length === 0) {
        this.els.panels.each(function() {
          $(this).append(warningEl.clone());
        });
      }
    },

    removeWarning: function() {
      this.els.container.removeClass('panel-danger');
      $('.unsaved-warning').remove();
    },

    createFileHtml: function(sectionsArray) {
      var $el = $('#editor__file');
      var lineObj = Goatools.File.Sections.parseLines(sectionsArray);

      // Clear previous information
      $el.html('');

      // Add the group line
      if (lineObj.group) {
        $el.append(makeEditorLine(lineObj.group, 'group'));
      }

      lineObj.sections.forEach(function(section) {
        var sectionContainer = makeSectionContainer(section[0]);

        // Append the section name line
        sectionContainer.append(makeEditorLine(section[0], 'section'));

        // Add goid lines
        section[1].forEach(function(goid) {
          if (goid.length > 0)
            sectionContainer.append(makeEditorLine(goid, 'goid'));
        });

        $el.append(sectionContainer);
      });
    },

    sectionDropOver: function(ev, el) {
      onDropOver.bind(this)(ev, el);
    }
  };


  function onOpenBtnClick() {
    if (Goatools.Form.els.form[0].checkValidity()) {
      changeBtn.bind(this)();
      Goatools.File.Sections.get();
    } else {
      Goatools.Form.els.form.submit();
    }
  }

  function changeBtn() {
    this.els.openBtn.off('click');

    this.els.openBtn
      .text('View/Edit')
      .on('click', Goatools.Form.Sections.Editor.show.bind(this));
  }

  function resetOpenBtn() {
    this.els.openBtn.off('click');

    this.els.openBtn
      .text('Generate')
      .on('click', onOpenBtnClick.bind(this));
  }

  function onSave() {
    this.removeWarning();
    Goatools.File.Sections.update();
  }

  function onClose(ev) {
    Goatools.Form.Sections.setSections(); // Must be first or editor won't hide
    this.hide(ev);
    this.removeWarning();
  }

  function makeSectionContainer(line) {
    var cssValidRegex = /[~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;
    var container = $('<div/>', {
      id: line ? line.replace(cssValidRegex, '') : '',
      class: 'editor__section-container'
    })
      .attr(
        'ondrop',
        'Goatools.Form.Sections.Editor.sectionDropOver(event, this)'
      );

    return container;
  }

  function makeEditorLine(item, type) {
    var $line = $('<div/>', {
      class: 'editor__' + type + '-line',
      html: type === 'section' ? '# SECTION: ' + item : item
    });

    if (type === 'goid') {
      $line.attr({
        id: item.substr(0, 10),
        draggable: 'true'
      })
        .on('dragstart', goidDragStart)
        .on('dragend', goidDragEnd);
    }
    return $line;
  }

  function addNewSection() {
    var $container = makeSectionContainer();
    var $line = makeEditorLine(
      '<span contenteditable="true">New section name</span>',
      'section'
    );
    var $newSection = $line.children(0);

    $container.append($line);
    $container.insertBefore($('.editor__section-container')[0]);

    selectEditable($newSection[0]);
    $newSection.on('keydown', onSectionNameKeydown);
  }

  function onSectionNameKeydown(ev) {
    var cssValidRegex = /[~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;
    var container = ev.target.parentElement.parentElement;

    // Set the id of the Sections container
    container.id = ev.target.innerText.replace(cssValidRegex, '');
    container.id = container.id.replace(/ /g, '-');

    if (ev.keyCode === 13 || ev.keycode === 27) {
      ev.preventDefault();
      ev.target.blur();
    }
  }

  function selectEditable(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function goidDragStart(ev) {
    var containers = $('.editor__section-container');

    // Add event listeners to 'editor__section-container'
    containers.on('dragenter', dragEnter)
      .on('dragleave', dragLeave)
      .on('dragover', dragOver);

    // Set the data to be transferred by dragging
    ev.originalEvent.dataTransfer.setData('text/plain', ev.target.id);

    // Allow the modal content to scroll while dragging
    stopScroll = false;
    scrollId = window.requestAnimationFrame(scroll);
  }

  function goidDragEnd() {
    var containers = $('.editor__section-container');

    // Unbind event listeners when not needed
    containers.off('dragenter', dragEnter)
      .off('dragleave', dragLeave)
      .off('dragover', dragOver);

    // End the scrolling loop
    cursor = null;
    stopScroll = true;
    window.cancelAnimationFrame(scroll);
  }

  function dragEnter(ev) {
    ev.preventDefault();
    var $targ = $(ev.target);

    if (ev.target !== this) {
      console.log('Entered a section');
      // Add goid line drag over classname if it doesn't exist
      if (!$targ.hasClass('editor__goid-line--drag-over')) {
        $targ.addClass('editor__goid-line--drag-over');
      }
    }
  }

  function dragLeave(ev) {
    if (ev.target === this) {
      $(ev.target).removeClass('editor__section-container--drag-over');
    } else {
      $(ev.target).removeClass('editor__goid-line--drag-over');
    }
  }

  function dragOver(ev) {
    ev.preventDefault();
    ev.originalEvent.dataTransfer.dropEffect = 'move';

    // Update the cursor position for the scroll loop
    cursor = ev.pageY;
  }

  function onDropOver(ev, el) { // eslint-disable-line no-unused-vars
    // TODO BUG: If there are duplicate GOID's it grabs the first one/not the dragged one
    ev.preventDefault();
    var id = ev.dataTransfer.getData('text');
    var toEl = ev.toElement;

    // Insert element and remove drag-over state
    el.insertBefore(document.getElementById(id), ev.toElement.nextSibling);
    toEl.className = toEl.className.replace('editor__goid-line--drag-over', '');

    // Stop the scroll loop used while dragging
    stopScroll = true;
    window.cancelAnimationFrame(scrollId);
    Goatools.Form.Sections.Editor.addWarning();
  }
})();

Goatools.Form.Sections.Editor.init();
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


// /**
//  * Create a container element for a section
//  * @param  {string} line The section name
//  * @return {HTMLElement}      Container div
//  */
// function makeSectionContainer(line) {
//   // var container = document.createElement('div');
//   var cssValidRegex = /[~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;
//   //
//   // if (line) {
//   //   container.id = line.replace(cssValidRegex, '');
//   // }
//   // container.className = 'editor__section-container';
//   // container.setAttribute('ondrop', 'sectionDropOver(event, this)');
//
//   var container = $('<div/>', {
//     id: line ? line.replace(cssValidRegex, '') : '',
//     class: 'editor__section-container',
//   })
//     .attr('ondrop', 'sectionDropOver(event, this)');
//
//   return container;
// }

// /**
//  * Create an element for an Editor line
//  * @param  {string} item The line text
//  * @param  {string} type Type of line that is created 'group', 'section', 'goid'
//  * @return {HTMLElement}      The line that is created
//  */
// function makeEditorLine(item, type) {
//   var $line = $('<div/>', {
//     class: 'editor__' + type + '-line',
//     html: type === 'section' ? '# SECTION: ' + item : item
//   });
//
//   if (type === 'goid') {
//     $line.attr({
//       id: item.substr(0, 10),
//       draggable: 'true'
//     })
//       .on('dragstart', goidDragStart)
//       .on('dragend', goidDragEnd);
//   }
//   return $line;
// }

// /**
//  * Creates HTML representation of the array created from sections.txt
//  * @param  {array} sectionsArray Array of strings representing the .txt file
//  * @return {undefined}
//  */
// function createTxtFileHtml(sectionsArray) { // eslint-disable-line no-unused-vars
//   // console.log('Create File HTML');
//   var $el = $('#editor__file');
//   // var el = document.getElementById('editor__file');
//   // var fragment = document.createDocumentFragment();
//   var lineObj = Goatools.File.Sections.parseLines(sectionsArray);
//
//   // Clear previous information
//   // el.innerHTML = '';
//   $el.html('');
//   if (lineObj.group) {
//     $el.append(makeEditorLine(lineObj.group, 'group'));
//   }
//
//   lineObj.sections.forEach(function(section) {
//     var sectionContainer = makeSectionContainer(section[0]);
//
//     // Append the section name line
//     sectionContainer.append(makeEditorLine(section[0], 'section'));
//
//     section[1].forEach(function(goid) {
//       if (goid.length > 0)
//         sectionContainer.append(makeEditorLine(goid, 'goid'));
//     });
//
//     // fragment.append(sectionContainer);
//     $el.append(sectionContainer);
//   });
//
//   // el.append(fragment);
// }

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
// function goidDragStart(ev) {
//   console.log(ev);
//   // Add event listeners to 'editor__section-container'
//   var containers = document.getElementsByClassName('editor__section-container');
//
//   for (var i = 0; i < containers.length; i++) {
//     var container = containers[i];
//
//     container.addEventListener('dragenter', sectionDragEnter, false);
//     container.addEventListener('dragleave', sectionDragLeave, false);
//     container.addEventListener('dragover', sectionDragOver, false);
//   }
//
//   // Set the data to be transferred by dragging
//   // ev.dataTransfer.setData('text/plain', ev.target.id);
//   ev.originalEvent.dataTransfer.setData('text/plain', ev.target.id);
//
//   // Allow the modal content to scroll while dragging
//   stopScroll = false;
//   scrollId = window.requestAnimationFrame(scroll);
// }

/**
 * Handle the event fired when dragging ends
 * @param  {object} ev The event object
 * @return {undefined}
 */
// function goidDragEnd() {
//   var containers = document.getElementsByClassName('editor__section-container');
//
//   // Unbind event listeners when not dragging
//   for (var i = 0; i < containers.length; i++) {
//     var container = containers[i];
//
//     container.removeEventListener('dragenter', sectionDragEnter, false);
//     container.removeEventListener('dragleave', sectionDragLeave, false);
//     container.removeEventListener('dragover', sectionDragOver, false);
//   }
//   // End the scrolling loop
//   cursor = null;
//   stopScroll = true;
//   window.cancelAnimationFrame(scroll);
// }

/**
 * Section Drag Handlers
 */

 /**
  * Handle the event fired when a line is dropped on 'editor__section-container'
  * @param  {object} ev The event object
  * @param  {HTMLElement} el The element that fired the event
  * @return {undefined}
  */
 // function sectionDropOver(ev, el) { // eslint-disable-line no-unused-vars
 //   console.time('Drop Over Handler');
 //   // TODO BUG: If there are duplicate GOID's it grabs the first one/not the dragged one
 //   ev.preventDefault();
 //   var id = ev.dataTransfer.getData('text');
 //
 //   el.insertBefore(document.getElementById(id), ev.toElement.nextSibling);
 //
 //   var target = ev.toElement;
 //   var targetParent = target.parentElement;
 //
 //   target.className = target.className
 //                      .replace(' editor__goid-line--drag-over', '');
 //   targetParent.className = targetParent.className
 //                           .replace(' editor__section-container--drag-over', '');
 //
 //   // Stop the scroll loop used while dragging
 //   stopScroll = true;
 //   window.cancelAnimationFrame(scrollId);
 //   Goatools.Form.Sections.Editor.addWarning();
 //   console.timeEnd('Drop Over Handler');
 // }

// /**
//  * Handle the event fired when entering a 'editor__section-container' element
//  * @param  {object} ev The event object
//  * @param  {HTMLElement} el The element that fired the event
//  * @return {undefined}
//  */
// function sectionDragEnter(ev) {
//   ev.preventDefault();
//   // if (el.className.indexOf('editor__section-container--drag-over') === -1) {
//   //   el.className += ' editor__section-container--drag-over';
//   // }
//
//   if (ev.target !== this) {
//     // Add goid line classname if it doesn't exist
//     if (ev.target.className.indexOf('editor__goid-line--drag-over') === -1) {
//       ev.target.className += ' editor__goid-line--drag-over';
//     }
//   } else {
//     // Add classname if it doesn't exist
//   }
// }

/**
 * Handle the event fired when leaving a 'editor__section-container' element
 * @param  {objec} ev The event object
 * @param  {HTMLElement} el The element that fired the event
 * @return {undefined}
 */
// function sectionDragLeave(ev) {
//   if (ev.target === this) {
//     ev.target.className = ev.target.className.replace(
//       ' editor__section-container--drag-over', ''
//     );
//     // console.log(ev.target);
//   } else {
//     // console.log('Left a section');
//     // console.log("Left a line");
//     ev.target.className = ev.target.className.replace(
//       ' editor__goid-line--drag-over', ''
//       );
//   }
// }

/**
 * Handle the dragover event fired while over 'editor__section-container'
 * @param  {event} ev The event object
 * @param  {HTMLElement} el The element that fired the event
 * @return {undefined}
 */
// function sectionDragOver(ev) {
//   ev.preventDefault();
//   ev.originalEvent.dataTransfer.dropEffect = 'move';
//
//   // Update the cursor position for the scroll loop
//   cursor = ev.pageY;
// }
