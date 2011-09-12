/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

$(document).ready(function() {
  var excludeThisBacklog = '';
  if (isEditingBacklog()) {
    excludeThisBacklog = '?exclude=' + document.location.href.match(/\/backlogs\/(\d+)\//i)[1];
  }
  // standard user rules
  var rules = {
    'backlog[name]': {
      required: true,
      remote: '/accounts/' + $('form#new_backlog, form.edit_backlog').attr('action').match(/^\/accounts\/(\d+)/i)[1] + '/backlogs/name_available' + excludeThisBacklog
    },
    'backlog[rate]': {
      required: true,
      number: true,
      min: 0
    },
    'backlog[velocity]': {
      required: true,
      number: true,
      min: 0
    }
  };

  // validate signup form on keyup and submit
  $("form#new_backlog, form.edit_backlog").validate({
    rules: rules,
    messages: {
      'backlog[name]': {
        required: "You must enter a backlog name",
        remote: 'That backlog name is already taken.  Please enter another name'
      }
    },
    // set this class to error-labels to indicate valid fields
    success: function(label) {
      // set &nbsp; as text for IE
      label.html("&nbsp;").addClass("correct");
    }
  });

  // store initial account defaults
  storeAccountDefaults();
  // hide / show the company selection depending on state
  setCompanyVisibility();
  $('input#backlog_has_company_false, input#backlog_has_company_true').change(function() {
    setCompanyVisibility();
  })
  $('a#add_new_company').click(function() {
    $('.existing').hide();
    $('.new').show();
    setAccountDefaults(); // use account defaults as adding a new company
    $('input#company_name').focus();
  });
  $('a#select_an_existing_company').click(function() {
    $('input#company_name').val('');
    $('.existing').show();
    $('.new').hide();
    getCompanyDefaults(); // get the company defaults for the selected company
    $('select#backlog_company_id').focus();
  });
  $('select#backlog_company_id').change(getCompanyDefaults);
});

function setCompanyVisibility() {
  if ($('input#backlog_has_company_false').is(':checked')) {
    $('.client-select, .existing, .new').hide();
    $('#has_company_false_label').addClass('selected');
    $('#has_company_true_label').removeClass('selected');
    setAccountDefaults(); // use account defaults as not using a company
  } else {
    $('#has_company_true_label').addClass('selected');
    $('#has_company_false_label').removeClass('selected');
    $('.client-select').show();
    if ($('#backlog_company_id option').length > 0) {
      // existing companies exist so let user choose a company as first option
      $('.existing').slideDown();
      $('select#backlog_company_id').focus();
      getCompanyDefaults();
    } else {
      // no companies, force user to enter a new company name
      $('.new').slideDown();
      $('.select-existing').hide();
      $('input#company_name').focus();
      setAccountDefaults(); // use account defaultas as adding a new company
    }
  }
}

function storeAccountDefaults() {
  $('input#backlog_rate').data('default', $('input#backlog_rate').val())
  $('input#backlog_velocity').data('default', $('input#backlog_velocity').val())
  $('input#backlog_use_50_90').data('default', $('input#backlog_use_50_90').attr('checked'));
}

function setAccountDefaults() {
  // don't change defaults if backlog already exists
  if (!isEditingBacklog()) {
    $('input#backlog_rate').val($('input#backlog_rate').data('default'));
    $('input#backlog_velocity').val($('input#backlog_velocity').data('default'));
    $('input#backlog_use_50_90').attr('checked', $('input#backlog_use_50_90').data('default'));
  }
}

function getCompanyDefaults() {
  // don't change defaults if backlog already exists
  if (!isEditingBacklog()) {
    var selected = $('select#backlog_company_id option:selected').val();
    var account_ID = document.location.href.match(/\/accounts\/(\d+)\//i);
    $.getJSON('/accounts/' + account_ID[1] + '/companies/' + selected + '.json', {}, function(data) {
      $('input#backlog_rate').val(data.default_rate);
      $('input#backlog_velocity').val(data.default_velocity);
      $('input#backlog_use_50_90').attr('checked', data.default_use_50_90);
    });
  }
}

function isEditingBacklog() {
  return $('form.edit_backlog').length > 0;
}