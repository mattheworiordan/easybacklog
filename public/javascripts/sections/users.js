$(document).ready(function() {
  $('input.admin:checkbox').change(function(event) {
    var id = $(event.target).attr('id').replace('user-','');
    var isAdmin;
    if ($(event.target).is(':checked')) {
      $('label#label-user-' + id).text('Yes');
      isAdmin = true;
    } else {
      $('label#label-user-' + id).text('No');
      isAdmin = false;
    }
    var payLoad = { id: id, admin: isAdmin }

    // Default JSON-request options.
    var params = {
      url:          document.location.pathname + '/' + id,
      type:         'PUT',
      contentType:  'application/json',
      data:         JSON.stringify(payLoad),
      dataType:     'json',
      processData:  false,
      success:      function(data) { console.log ('Updated user successfully'); },
      error:        function(jqXHR, textStatus, errorThrown) { 
        console.log(textStatus); 
        console.log(errorThrown); 
        new App.Views.Error({ message: 'The user could not be updated, please refresh your browser'}); 
      }
    };

    $.ajax(params);
  })
});