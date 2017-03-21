var Goatools = Goatools || {}; // eslint-disable-line no-use-before-define
Goatools.Plots = Goatools.Plots || {};

(function() {
  'use strict';

  /**
   * Public Methods
   */
  Goatools.Plots = {
    els: {
      progressBar: $('#progress-bar'),
      srProgress: $('#progress-bar + span'),
      plotImg: null
    },

    init: {

    },

    getAll: function() {
      var $parent = $('#plots');
      var frag = document.createDocumentFragment();

      Goatools.callServer('../plots')
      .then(function(response) {
        Goatools.Plots.els.progressBar.text('');

        (function addImages(index) {
          setTimeout(function() {
            // Set the progress indicator
            var percent = (index + 1) / response.length * 100;
            Goatools.Plots.setProgressBar(percent);

            // Add svg to fragment
            frag.appendChild(Goatools.Plots.createPlotDiv(response[index]));

            // Call the next image or add images to page
            if (++index < response.length) {
              addImages(index);
            } else {
              $parent.html(frag);
              // Temporary fix to save my sanity
              $('svg').removeAttr('width height');
            }
          }, 1 * index);
        })(0);
      })
      .fail(function(response) {
        $('#table-tab').click();
      });
    },

    // TODO: The AJAX fucntion for all of the plots should be able to use this method - thus extract all plot functions to new module
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
        .on('mousedown', 'svg', startPanPlotImage.bind(this))
        .on('mouseup', 'svg', stopPanPlotImage.bind(this))
        .on('mouseleave', stopPanPlotImage.bind(this));

      $imgModal.modal('show');
      $('.modal-body', $imgModal).html(imgCont);
      $('svg', $imgModal).removeAttr('width height');
      console.timeEnd('Show Plot');
    },

    // Must stay public due to setTimeout
    createPlotDiv: function(dotFileStr) {
      // Remove dpi to gain control over the image's size
      var strippedStr = dotFileStr.replace(/dpi=[0-9]+,/g, '');
      var svgString = Viz(strippedStr, {format: 'svg'}); // eslint-disable-line new-cap
      var goid = dotFileStr.match(/GO:[0-9]+/)[0];

      // Container for description, button, and svg
      var $imgCont = $('<div/>', {
        id: goid + '-plot-image',
        class: 'plot-image__container plot-image',
        html: svgString
      })
        .on('mousemove', panPlotImage.bind(this))
        .on('mousedown', 'svg', startPanPlotImage.bind(this))
        .on('mouseup', 'svg', stopPanPlotImage.bind(this))
        .on('mouseleave', stopPanPlotImage.bind(this))
        // Prevent image from moving on description click
        .on('mousemove', 'p', function() {return false;});

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
            Goatools.Plots.triggerDownload(img.src, goid);
          }

        });

        // Add the description and download button to the div
        $imgCont.prepend($desc);
        $imgCont.prepend($btn);

        return $imgCont[0];
    },

    // Has to stay public due to setTimeout
    setProgressBar: function(percent) {
      this.els.progressBar.css('width', percent + '%');
      this.els.srProgress.text(percent + '% complete');
    },

    triggerDownload: function(imgURI, goid) {
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
  };

  /**
   * Private Methods
   */
   var translateObj;
   function panPlotImage(ev) {
     var imgCont = $(ev.currentTarget);
     // Stop text selection
     ev.preventDefault();

     if (translateObj && ev.buttons === 1) {
       console.log('Panning plot image');
       // Elements to work with
       var el = this.els.plotImg;
       var mainCont = imgCont.parent();

       // Allow relative panning when zoomed
       var wdScale = el.width() / mainCont.width();
       var htScale = el.height() / mainCont.height();

       // Calculate the amount to translate
       var cursor = {
         x: mainCont.width() * translateObj.imgXPrct,
         y: mainCont.height() * translateObj.imgYPrct
       };
       var heightDiff = mainCont.height() / 2 - cursor.y;
       var widthDiff = mainCont.width() / 2 - cursor.x;

       // Translate the image
       var value = widthDiff * wdScale + 'px,' + heightDiff * htScale + 'px';
       this.els.plotImg.css('transform', 'translate(' + value + ') scale(3)');
     }

     // Set translateObj for next call
     translateObj = {
       imgXPrct: (ev.pageX - imgCont.offset().left) / imgCont.width(),
       imgYPrct: (ev.pageY - imgCont.offset().top) / imgCont.height()
     };
   }

   function startPanPlotImage(ev) {
    this.els.plotImg = $(ev.currentTarget);
    panPlotImage.bind(this)(ev);
   }

   function stopPanPlotImage() {
     this.els.plotImg.css('transform', 'translate(0, 0)');
   }
})();
