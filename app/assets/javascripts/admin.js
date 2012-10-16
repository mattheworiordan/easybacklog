$(function() {
  var search = function() {
    var newURL = document.location.href.replace(/([\?&]filter=)[^&]*/,'$1' + escape($('.admin-filter input').val()));
    if (newURL.indexOf('filter=') < 0) {
      if (newURL.indexOf('?') < 0) {
        newURL += "?"
      } else {
        newURL += "&"
      }
      newURL += 'filter=' + escape($('.admin-filter input').val());
    }
    document.location.href = newURL;
  };

  $('.admin-filter button').on('click', search);
  $('.admin-filter input').on('keypress', function(event) {
    if (event.which === 13) search();
  });
  $('.admin-filter a.cancel').on('click', function() {
    $('.admin-filter input').val('');
    search();
  });
});