(function($) {
  $.fn.extend({
    outerHtml: function(limitChars) {
      if (limitChars && !isNaN(parseInt(limitChars))) {
        return this[0].outerHTML.substring(0,limitChars);
      } else {
        return this[0].outerHTML;
      }
    }
  });
})(jQuery);