$(function() {
  var $groups = $('.form-group');

  describe('Form groups', function() {
    it('has four groups', function() {
      expect($groups.length).toEqual(4);
    });
  });

  describe('Go Id group', function() {
    var group = $groups[0];

    it('has 2 labels', function() {
      expect($('label', group).length).toEqual(2);
    });

    it('has a textarea element', function() {
      expect($('textarea', group).length).toEqual(1);
    });

    it('has an examples dropdown', function() {
      expect($('button + ul', group).length).toEqual(1);
    });

    it('has examples in the example dropdown', function() {
      expect($('button + ul', group).children().length).toBeGreaterThan(0);
    });

    it('has a help icon', function() {
      expect($('.info-circle', group).length).toEqual(1);
    });

// Testing the HTML spec?
    xit('raises an exception when empty', function() {

    });

    xit('rejects a sections file', function() {

    });

    xit('adds an error message', function() {

    });

    xit('adds goids from a file', function() {

    });
  });

  describe('Sections File Group', function() {
    var group = $groups[1];

    it('has a generate button', function() {
      expect($('#editor__open-button').length).toEqual(1);
    });



// Figure out the ASYNC stuff
    describe('Editor', function() {
      var goids = 'GO:0002376, GO:0002682, GO:0001817, GO:0001816, GO:0034097, GO:0045087, GO:0006954, GO:0002521, GO:0002467, GO:0007229, GO:0050900, GO:0022610, GO:0030155, GO:0007155, GO:0016032, GO:0050792, GO:0098542';
      var editorId = '#editor';
      var $addSectionButton = $('#editor__add-section');
      var $closeButton = $('button.close', group)[0];
      var sectionContClass = '.editor__section-container';
      var warningClass = 'panel-danger';

      beforeEach(function(done) {
        getSectionsFile(goids, null, null, done);
      });

      afterEach(function() {
        // Goatools.Editor.hide(); // Doesn't call reset sections which could be problem for other tests
        $closeButton.click();
      });

      it('is shown after getting sections file', function() {
        expect($(editorId).children().length).toBeGreaterThan(1);
      });

      it('adds a new section', function() {
        $addSectionButton.click();
        expect($(sectionContClass).length).toBeGreaterThan(1);
      });

      it('dismisses changes when closed', function() {
        $addSectionButton.click();
        expect($(sectionContClass).length).toEqual(2);
        $closeButton.click();
        expect($(sectionContClass).length).toEqual(1);
      });

      xit('saves changes if a goid is moved to a new group', function(done) {
        $addSectionButton.click();
        var $elToMove = $(sectionContClass).last().children().last();
        var $target = $(sectionContClass).first();
        var $elToMoveLocation = $elToMove.offset();
        var $targetLocation = $target.offset();
        console.log($targetLocation);
        var mouseDown = $.Event('mousedown', {
          which: 0,
          pageX: $elToMoveLocation.left + 5,
          pageY: $elToMoveLocation.top + 5
        });

        var mouseUp = $.Event('mouseup', {
          which: 0,
          pageX: $targetLocation.left + 5,
          pageY: $targetLocation.top + 5
        });
        $elToMove.trigger(mouseDown);
        $elToMove.trigger(mouseUp);

        // Really ugly way to move an element from existing group to new group

        updateSections(done);
        expect($(sectionContClass).length).toEqual(2);
      });

      xit('has a warning message when unsaved', function() {
        $addSectionButton.click();
        // Really ugly way to move an element from existing group to new group
        $(sectionContClass).last().children().last().detach().appendTo($(sectionContClass).first());
        // The following would work if the previous triggered the drop event.
        console.log($(editorId).parent().parent().hasClass(warningClass));
      });

      xit('scrolls when needed', function() {

      });

      xit('shows hovering over goids', function() {

      });
    });

    it('has 2 labels', function() {
      expect($('label', group).length).toEqual(2);
    });

    it('has a help icon', function() {
      expect($('.info-circle', group).length).toEqual(1);
    });

    xit('adds the filename after file upload', function() {

    });

    xit('has a view/edit button after generate is clicked and editor is closed', function() {

    });
  });

  describe('File Download Group', function() {
    var group = $groups[2];

    it('has a label', function() {
      expect($('label', group).length).toEqual(1);
    });

    it('has a default filename', function() {
      expect($('input', group).val()).toEqual('gene-ontology');
    });

// Testing the HTML spec?
    // xit('accepts a user filename', function() {
    //   // Figure this out
    //   $('input', group).val('');
    //   $('button:contains("Submit")').click();
    //   console.log($('input', group).val());
    // });

    xit('raises an error when empty', function() {

    });
  });

  describe('Button Group', function() {
    var group = $groups[3];
    var $inputs = $('input', group);

    it('has 2 buttons', function() {
      expect($inputs.length).toEqual(2);
    });

    it('has a reset button', function() {
      expect($inputs[0].type).toEqual('reset');
    });

    it('has a submit button', function() {
      expect($inputs[1].type).toEqual('submit');
    });

    // Seems like I am testing the html spec here
    // it('resets the form', function() {
    //   var prevVal = $('#goids').val();
    //   $inputs[0].click();
    //   expect($('#goids').val()).toEqual('');
    //   console.log(prevVal);
    // });

    // Ditto
    // xit('submits the form', function() {
    //
    // });
  });
}());
