/* global $ window document Viz*/
/* eslint-disable no-alert */

var Goatools = Goatools || {} // eslint-disable-line

/**
 * Function used to call the Goatools server for information
 * @param  {string} url  The url to used
 * @param  {object} data The data the endpoint expectations
 * @return {function}      Allows using .then() to work with the response
 */
function callServer(url, data) { // eslint-disable-line no-unused-vars
  var csrftoken = getCookie('csrftoken');
  var reqType = url === 'generatesections/' ? 'POST' : 'GET';
  console.log('SERVER IS BEING CALLED');
  return $.ajax({
    url: url,
    type: reqType,
    data: data || {},

    beforeSend: function(xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
    },

    success: function(response) {
      return response;
    },

    error: function(xhr, errmsg, err) { // eslint-disable-line no-unused-vars
      console.log('Ajax Error');
    }
  });
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
 * Used by svg event listeners to trigger downlad after canvas is drawn
 * @param  {[type]} imgURI [description]
 * @return {[type]}        [description]
 */
function triggerDownload(imgURI, goid) {
  var evt = new MouseEvent('click', {
    view: window,
    bubbles: false,
    cancelable: true
  });

  var a = document.createElement('a');
  a.setAttribute('download', 'test' + '.png'); // TODO: 'test' should be goid
  a.setAttribute('href', imgURI);
  a.setAttribute('target', '_blank');

  a.dispatchEvent(evt);
}

var $progressBar = $('#progress-bar');
var $srProgress = $('#progress-bar + span');

function setProgressbar(percent) {
  console.log('Setting Progress Bar', percent);
  // var percent = numerator / denominator * 100;
  $progressBar.css('width', percent + '%');
  $srProgress.text(percent + '% complete');
}

function createPlotDiv(dotFileStr) {
  // Remove dpi to gain control over the image's size
  var strippedStr = dotFileStr.replace(/dpi=[0-9]+,/g, '');
  var svgString = Viz(strippedStr, {format: 'svg'}); // eslint-disable-line new-cap
  var goid = dotFileStr.match(/GO:[0-9]+/)[0];

  // Container for description, button, and svg
  var $imgCont = $('<div/>', {
    id: goid + '-plot-image',
    class: 'plot-image__container',
    html: svgString
  });
    // .on('mousemove', panPlotImage.bind(this))
    // .on('mousedown', startPanPlotImage.bind(this))
    // .on('mouseup', stopPanPlotImage.bind(this))
    // .on('mouseleave', stopPanPlotImage.bind(this));


  // Desciption for the SVG
  var $desc = $('<p/>', {
    class: 'plot-image__description',
    text: "Plot image for " + goid
  });


  // Download button for the SVG
  var $btn = $('<button/>', {
    class: 'plot-image__download btn btn-primary',
    text: 'Download'
  })
    .on('click', function(ev) {
      var img = Viz(strippedStr, {format: 'png-image-element', scale: 2}); // eslint-disable-line new-cap

      img.onload = function() {
        triggerDownload(img.src, goid);
      }

    });

    // Add the description and download button to the div
    $imgCont.prepend($desc);
    $imgCont.prepend($btn);

    return $imgCont[0];
}
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
        console.time('AJAX Success Function');

        $progressBar.text('');

        // Create svg elements from JSON response

          response.forEach(function(dotFileStr, idx) {
            setTimeout(function() {
              var percent = (idx + 1) / response.length * 100;
              requestAnimationFrame(function() {
                setProgressbar(percent);
              });
              frag.appendChild(createPlotDiv(dotFileStr));

              if (response.length - 1 === idx) {
                $parent.html(frag);
                // Temporary fix to ease my sanity
                $('svg').removeAttr('width height');
              }

            }, 100 * idx);
          });


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
var hdrHeight = $('header').outerHeight();
var ftrHeight = $('footer').outerHeight();
var tabHeight = $('#results-tabs').outerHeight();
var lnkHeight = $('.results__links').outerHeight();
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
  // $('#go-info').click();
  // $('#sections-info').click();
  // var timer = setInterval(function() {
  //   $('#dev-shortcut').click();
  // }, 500);

  // setTimeout(function() {
  //   clearInterval(timer);
  // }, 2250);
});
