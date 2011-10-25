(function($) {
  $.fn.extend({
    outerHtml: function(limitChars) {
      var html = this[0].outerHTML || new XMLSerializer().serializeToString(this[0]);
      if (limitChars && !isNaN(parseInt(limitChars))) {
        return html.substring(0,limitChars);
      } else {
        return html.outerHTML;
      }
    }
  });
})(jQuery);