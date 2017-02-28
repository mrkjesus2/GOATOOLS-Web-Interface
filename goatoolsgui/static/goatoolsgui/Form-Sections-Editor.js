/* global document window callServer Viz $ */
var Goatools = Goatools || {}; // eslint-disable-line no-use-before-define
Goatools.Form = Goatools.Form || {};
Goatools.Form.Sections = Goatools.Form.Sections || {};

(function() {
  'use strict';

  /*
    Private Variables
   */
  var sectsModule = Goatools.Form.Sections;
  // Variables needed for scroll function
  var scrollId = 0;
  var stopScroll = true;
  var cursor; // Set by dragOver
  var height = window.innerHeight; // Query once, improve performance

  /*
    Public Methods
   */
  Goatools.Form.Sections.Editor = {
    els: {
      openBtn: $('#editor__open-button'),
      saveBtn: $('.editor__save-btn'),
      closeBtns: $('.close'),
      panels: $('.panel-heading'),
      container: $('.panel'),
      addSectionBtn: $('#editor__add-section'),
      file: $('#editor__file'),
      plotImg: null
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
      var $el = this.els.file;
      var lineObj = Goatools.File.Sections.parseLines(sectionsArray);
      var collapsible = lineObj.sections.length > 2;

      // Clear previous information
      $el.html('');

      // Add the group line
      if (lineObj.group) {
        $el.append(makeGroupLine(lineObj.group));
      }

      lineObj.sections.forEach(function(section) {
        var name = section[0].trim();
        var $sectionContainer = makeSectionContainer(name, collapsible); // Add data stuff and aria stuff here
        // Append the section name line
        $sectionContainer.prepend(makeSectionLine(name, collapsible));

        // Add goid lines
        section[1].forEach(function(goid) {
          if (goid.length > 0) {
            var $line = makeGoidLine(goid);
            $sectionContainer.children().last().append($line);
          }
        });

        $el.append($sectionContainer);
      });
    },

    showPlotImg: function(data) {
      console.time('Show Plot');
      var $imgModal = $('#plot-image-modal');
      var img = Viz(data.replace(/dpi=[0-9]+,/g, ''), {format: 'svg'}); // eslint-disable-line new-cap

      var imgCont = $('<div/>', {
        id: 'plot-image',
        class: 'plot-image',
        html: img
      })
        .on('mousemove', panPlotImage.bind(this))
        .on('mousedown', startPanPlotImage.bind(this))
        .on('mouseup', stopPanPlotImage.bind(this))
        .on('mouseleave', stopPanPlotImage.bind(this));

      $imgModal.modal('show');
      $('.modal-body', $imgModal).html(imgCont);
      $('svg', $imgModal).removeAttr('width height');
      console.timeEnd('Show Plot');
    },

    sectionDropOver: function(ev, el) {
      onDropOver.bind(this)(ev, el);
    }
  };

  /*
    Private Methods
   */
  var translateObj;
  function panPlotImage(ev) {
    this.els.plotImg = this.els.plotImg || $('#plot-image').children().eq(0);
    var imgCont = this.els.plotImg.parent().eq(0);

    // Stop text selection
    ev.preventDefault();

    if (translateObj && ev.buttons === 1) {
      // Elements to work with
      var el = this.els.plotImg;
      var mainCont = imgCont.parent();

      // Allow relative panning when zoomed
      var scale = el.height() / mainCont.height();

      // Calculate the amount to translate
      var cursor = {
        x: mainCont.width() * translateObj.imgXPrct,
        y: mainCont.height() * translateObj.imgYPrct
      };
      var heightDiff = mainCont.height() / 2 - cursor.y;
      var widthDiff = mainCont.width() / 2 - cursor.x;

      // Translate the image
      var value = widthDiff * scale + 'px,' + heightDiff * scale + 'px';
      this.els.plotImg.css('transform', 'translate(' + value + ')');
    }

    // Set translateObj for next call
    translateObj = {
      imgXPrct: (ev.pageX - imgCont.offset().left) / imgCont.width(),
      imgYPrct: (ev.pageY - imgCont.offset().top) / imgCont.height()
    };
  }

  function startPanPlotImage(ev) {
    panPlotImage.bind(this)(ev);
  }

  function stopPanPlotImage() {
    this.els.plotImg.css('transform', 'translate(0, 0)');
  }

  function scroll() {
    if (cursor < 210) {
      // Scroll up faster
      window.scrollBy(0, -10);
    } else if (cursor > height - 50) {
      // Scroll down faster
      window.scrollBy(0, 10);
    } else if (cursor < 260) {
      // Scroll up slow
      window.scrollBy(0, -5);
    } else if (cursor > height - 100) {
      // Scroll down slow
      window.scrollBy(0, 5);
    }

    if (!stopScroll) {
      scrollId = window.requestAnimationFrame(scroll);
    }
  }

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

/*
  createFileHtml helper functions
 */
  function makeValidId(str) {
    var cssValidRegex = /[ ~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;
    var validId = str ? str.replace(cssValidRegex, '') : '';
    return validId;
  }

  function makeSectionContainer(line, collapsed) {
    var $container = $('<div/>', {
      id: makeValidId(line),
      class: 'editor__section-container'
    })
      .attr(
        'ondrop',
        'Goatools.Form.Sections.Editor.sectionDropOver(event, this)'
      );

    // Add ul - collapsed if more than 2 sections
    var $ul = $('<ul/>', {
      id: makeValidId(line) + 'Ids',
      class: collapsed ? 'collapse' : 'collapse in'
    })
      .on('hide.bs.collapse', function() {
        var icon = $('.editor__section-icon', this.previousSibling);
        icon.toggleClass('editor__section-icon--open');
      })
      .on('show.bs.collapse', function() {
        var icon = $('.editor__section-icon', this.previousSibling);
        icon.toggleClass('editor__section-icon--open');
      });

    $container.append($ul);

    return $container;
  }

  function makeGroupLine(text) {
    var $line = $('<div/>', {
      class: 'editor__group-line',
      html: text
    });

    return $line;
  }

  function makeSectionLine(text, collapsed) {
    var iconCls = 'glyphicon glyphicon-menu-down editor__section-icon';

    var $caret = $('<span/>', {
      'class': collapsed ? iconCls : iconCls + ' editor__section-icon--open',
      'role': 'button',
      'data-toggle': 'collapse',
      'data-target': '#' + makeValidId(text) + 'Ids',
      'aria-expanded': collapsed ? 'false' : 'true',
      'aria-controls': makeValidId(text) + 'Ids'
    });

    var $line = $('<div/>', {
      class: 'editor__section-line',
      html: '<span> # SECTION: ' + text + '</span>'
    });

    $line.prepend($caret);

    return $line;
  }

  function makeGoidLine(text) {
    var $line = $('<li/>', {
      id: text.substr(0, 10),
      class: 'editor__goid-line',
      html: text,
      draggable: 'true'
    })
      .on('dragstart', goidDragStart)
      .on('dragend', goidDragEnd);

    var $link = $('<button/>', {
      class: 'btn btn-primary btn-xs',
      type: 'button',
      text: 'Plot'
    })
      .on('click', function() {
        callServer('plots/one').then(function(response) {
          Goatools.Form.Sections.Editor.showPlotImg(response);
        });
      });

    $line.prepend($link);
    return $line;
  }

/*
  Add a new section functions
 */
  function addNewSection(ev, text) {
    var lineText = text || 'New section name';
    var $container = makeSectionContainer(lineText, false);
    var $line = makeSectionLine(lineText, false);

    $container.prepend($line);
    $container.insertBefore($('.editor__section-container')[0]);

    // Allow editing section name the first time
    if (!text) {
      var $newSection = $line.children().last();
      var prefix = ' # SECTION: ';
      var editable = "<span contenteditable='true'>" + lineText + '</span>';
      $newSection.html(prefix + editable);
      selectEditable($newSection[0].lastChild);
      $newSection.on('keydown', onSectionNameKeydown);
    }
  }

  function onSectionNameKeydown(ev) {
    // var cssValidRegex = /[ ~!@$%^&*()+=,.\/';:"?><[\]\\{}|`#]/g;
    var $container = $('#Newsectionname');
    var name = ev.target.innerText;

    if (ev.keyCode === 13 || ev.keycode === 27) {
      ev.preventDefault();

      $container.remove();
      addNewSection(null, name);
    }
  }

  function selectEditable(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

/*
  Drag and Drop Event Handlers
 */
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
    cursor = ev.screenY;
  }

  function onDropOver(ev, el) { // eslint-disable-line no-unused-vars
    ev.preventDefault();

    var id = ev.dataTransfer.getData('text');
    var newEl = document.getElementById(id);
    var toEl = ev.toElement;

    if (ev.target.className.includes('editor__section-line')) {
      el.lastChild.insertBefore(newEl, el.lastChild.firstChild);
    } else {
      el.lastChild.insertBefore(newEl, ev.target.nextSibling);
    }

    // Remove drag-over state
    toEl.className = toEl.className.replace('editor__goid-line--drag-over', '');

    // Stop the scroll loop used while dragging
    stopScroll = true;
    window.cancelAnimationFrame(scrollId);
    Goatools.Form.Sections.Editor.addWarning();
  }
})();

Goatools.Form.Sections.Editor.init();
