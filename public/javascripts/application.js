$(document).ready(function() {
  $('h2.editable').editable(AjaxDispatcher.ContentUpdated, {
    onblur: 'submit',
    data: AjaxDispatcher.BeforeChange
  });

  $('a').live('confirm', function() {
    var clicked_link = $(this);
    $('#dialog-confirm').dialog({
      resizable: false,
      height:140,
      modal: true,
      buttons: {
        "Delete": function() {
          clicked_link.attr('data-confirm','').click();
          $(this).dialog("close");
        },
        Cancel: function() {
          $(this).dialog("close");
        }
      }
    });
    return (false);
  })
})

// Manage dispatching of AJAX changes from Backlog page to relevant controllers
function AjaxDispatcherClass()
{
  this.BeforeChange = function(value, settings)
  {
    this.beforeChangeValue = value; // store value in elem
    return (value);
  }
  this.ContentUpdated = function(value, settings)
  {
    if (value != this.beforeChangeValue) {
      if ($(this).hasClass('backlog-name')) {
        AjaxDispatcher.SubmitData('backlog-name', '', this, value, this.beforeChangeValue);
      }
    }
    return (value);
  }

  this.SubmitData = function(data_type, data_id, elem, new_value, old_value)
  {
    $.ajax({
      type: 'PUT',
      url: $('input[type=hidden][id=ajax-data-path]').attr('value'),
      data: 'data_type=' + data_type + '&data_id=' + data_id + '&new_value=' + escape(new_value),
      success: function(msg) {
        if (!msg || msg['result'] != 'success')
        {
          AjaxDispatcher.ShowError('An error has occurred: ' + msg['reason']);
        } else {
          AjaxDispatcher.ClearError();
        }
      },
      error: function() {
        AjaxDispatcher.ShowError('A communication error with the server has occurred.')
      },
      dataType: 'json'
    });
  }
  this.ShowError = function(error)
  {
    $('#alert-space').html('<div class="alert">' + error + '</div>');
  }
  this.ClearError = function()
  {
    $('#alert-space').html('');
  }
}
AjaxDispatcher = new AjaxDispatcherClass();

// MVC namespace for Backbone.js
var App = {
    Views: {},
    Controllers: {},
    Collections: {}
};