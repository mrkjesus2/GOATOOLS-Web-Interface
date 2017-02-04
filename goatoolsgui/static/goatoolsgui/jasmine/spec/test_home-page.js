$(function() {
  describe('Header', function() {
    var className = '.navbar-header';
    var $mainNav = $('#main-nav');

    it('does exist', function() {
      expect($(className).length).toEqual(1);
    });

    it('has a home link', function () {
      expect($(className + ' a').length).toBeGreaterThan(0);
    });

    it('has a navigation section', function() {
      expect($mainNav.length).toBeGreaterThan(0);
    });
  });

  describe('Description', function() {
    var $el = $('.intro');

    it('does exist', function() {
      expect($el.text().match(/[a-z]+/g).length).toBeGreaterThan(0);
    });
  });

  describe('Form', function() {
    it('does exist', function() {
      expect($('form').length).toBeGreaterThan(0);
    });
  });

  describe('Footer', function() {
    var text = $('footer.navbar p').text();

    it('does exist', function() {
      expect($('.navbar-fixed-bottom').length).toBeGreaterThan(0);
    });

    it('has a copyright starting in 2016', function() {
      var match = text.match('2016-');
      expect(match.length).toBeGreaterThan(0);
    });

    it('has a copyright ending in the current year', function() {
      var date = new Date();
      var match = text.match('-' + date.getFullYear());
      expect(match.length).toBeGreaterThan(0);
    });
  });
}());
