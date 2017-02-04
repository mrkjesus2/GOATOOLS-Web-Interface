var Goatools = Goatools || {}
var sectionsStringArray;
/* global $ window document FileReader*/
/* eslint-disable no-alert */

// Add listener to go-ids input to fill the text area
$('#gos_file').change(function() {
  Goatools.File.read(this.files[0], this.id);
});

// Add listener to sections file input to add filename
$('#sections_file').change(function() {
  Goatools.File.read(this.files[0], this.id);
});

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

/*
   Bootstrap functionality
 */
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

/**
 * Fetch plot dot strings and display svg images
 */
$('#results-tabs a').on('shown.bs.tab', (function(ev) {
  ev.preventDefault();

  var ref = $(this).attr('href');
  var tabContent = $('.tab-content');

  // Call for the plots if we don't yet have them
  if ($(ref).children().length <= 1) {
    // console.log('We will get the plot information');
    var $progressBar = $('#progress-bar');
    var $srProgress = $('#progress-bar + span');
    var $parent = $('#plots');
    var frag = document.createDocumentFragment();
    // TODO: Speed up loading by initializing an animation here and canceling
    // in first iteration for the sucess or failure for loop.
    console.time('AJAX Time');
    $.ajax({
      url: "../plots/",
      type: "GET",

      // TODO: The function can be faster without setTimeout, but need to indicate something is happening
      success: function(response) {
        $progressBar.text('');
        console.time('AJAX Success Function');
        // Create svg elements from JSON response
        response.forEach(function(dotFileStr, idx) {
        // for (var i = 0; i < response.length; i++) {
          (function(dotFileStr, idx) {
            setTimeout(function() {
              // Update the progress before createing each image
              var percent = (idx + 1) / response.length * 100;
              $progressBar.css('width', percent + '%');
              $srProgress.text(percent + '% complete');

              // Create the svg image and append to fragment
              // if you want pngs here is the 2nd arg - , {format: "png-image-element", scale: 2}
              var plot = Viz(dotFileStr.replace(/dpi=[0-9]+,/g, ''));
              var container = document.createElement('div');
              container.innerHTML = plot;
              frag.append(container);
              if (response.length - 1 === idx) {
                $parent.append(frag);
                $('#progress').remove();
                console.timeEnd('AJAX Time');
              }
            }, 200 * idx);
          }(dotFileStr, idx));
        });
        // $parent.append(frag);

        console.timeEnd('AJAX Success Function');
      },

      error: function(xhr, errmsg, err) {
        console.log("Failure");
        console.log(err);
      }
    });
  }

  // Hide all panes and show the one that was clicked
  tabContent.find('.tab-pane').hide();
  tabContent.find(ref).show();
}));

/*
  Fixed Header Table JS
 */
var hdrHeight = $('header').height();
var ftrHeight = $('footer').height();
var tabHeight = $('#results-tabs').height();
var lnkHeight = $('.results-links').outerHeight();
var wndwHeight = window.innerHeight;
// var wndwWidth = window.innerWidth;

$(document).ready(function() {
  var height = wndwHeight - hdrHeight - ftrHeight - tabHeight - lnkHeight;
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
  $('#goids').val('GO:0002376, GO:0002682, GO:0001817, GO:0001816, GO:0034097, GO:0045087, GO:0006954, GO:0002521, GO:0002467, GO:0007229, GO:0050900, GO:0022610, GO:0030155, GO:0007155, GO:0016032, GO:0050792, GO:0098542');
//   $('#section_names').val('sections1, sections2');
  // $('#dev-shortcut').click();
  // var timer = setInterval(function() {
  //   $('#dev-shortcut').click();
  // }, 500);

  // setTimeout(function() {
  //   clearInterval(timer);
  // }, 2250);
});
