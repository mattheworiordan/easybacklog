/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

App.Views.BacklogCreateUpdateMethods = (function() {
  var setDaysEstimatableVisibility; // ensure fn is available outside of initializeManageBacklog

  function initializeManageBacklog() {
    // validate signup form on keyup and submit
    var frm = $("form#new_backlog, form.edit_backlog");
    frm.validate({
      rules: {
        'backlog[name]': {
          required: true
        },
        'backlog[rate]': {
          number: true,
          min: 0
        },
        'backlog[velocity]': {
          number: true,
          min: 0.1
        }
      },
      messages: {
        'backlog[name]': {
          required: "You must enter a backlog name",
          remote: 'That backlog name is already taken.  Please enter another name'
        },
        'backlog[velocity]': {
          min: 'Please enter a velocity greater than zero'
        }
      },
      // set this class to error-labels to indicate valid fields
      success: function(label) {
        // set &nbsp; as text for IE
        label.html("&nbsp;").addClass("correct");
      }
    });

    // set up backlog settings, if not editing the backlog, then default to show points if no preference yet exists
    setDaysEstimatableVisibility = App.Views.Shared.EnableBacklogEstimationPreferences(frm, 'backlog');

    // store initial account defaults
    storeAccountDefaults();
    // highlight the label when the check boxes are selected
    $('input#backlog_has_company_false, input#backlog_has_company_true').change(function() { setCompanyVisibility() });
    // show new company text boxes
    $('a#add_new_company').click(function(event) {
      event.preventDefault();
      $('.client-select .existing').hide();
      $('.client-select .new').show();
      return;
      setAccountDefaults(); // use account defaults as adding a new company
      $('input#company_name').focus();
    });
    // show drop down of existing companies
    $('a#select_an_existing_company').click(function(event) {
      event.preventDefault();
      $('input#company_name').val('');
      $('.client-select .existing').show();
      $('.client-select .new').hide();
      getCompanyDefaults(); // get the company defaults for the selected company
      $('select#backlog_company_id').focus();
    });

    // hide the option to select an existing company if none yet exist
    if ($('.client-select .existing select option').length === 0) { $('.client-select .new .select-existing').hide(); }

    // if this page is in a non-editable state, then trim the page down and disable all input elements
    if ($('.not-editable-notice').length) {
      $('input[type=text],input[type=checkbox],input[name="backlog[scoring_rule_id]"],select').attr('disabled', true);
      $('#backlog_has_company_false, #backlog_has_company_true').attr('disabled', true);
      $('.client-select .new-company').hide();
    }

    // hide / show the company selection depending on state
    setCompanyVisibility(true);
    // update company defaults when selecting a company
    $('select#backlog_company_id').change(function() { getCompanyDefaults(); });
  };

  function setCompanyVisibility(firstCall) {
    if ($('input#backlog_has_company_false').is(':checked')) {
      $('.client-select, .client-select .existing, .client-select .new').hide();
      $('#has_company_false_label').addClass('selected');
      $('#has_company_true_label').removeClass('selected');
      setAccountDefaults(firstCall); // use account defaults as not using a company
    } else {
      $('#has_company_true_label').addClass('selected');
      $('#has_company_false_label').removeClass('selected');
      $('.client-select').show();
      if ($('#backlog_company_id option').length > 0) {
        // existing companies exist so let user choose a company as first option
        $('.client-select .existing').css('height','auto').slideDown(); // strange bug when redisplaying this tab height is set to 1px
        $('select#backlog_company_id').focus();
        getCompanyDefaults(firstCall);
      } else {
        // no companies, force user to enter a new company name
        $('.client-select .new').css('height','auto').slideDown(); // strange bug when redisplaying this tab height is set to 1px
        $('.client-select .existing').hide();
        $('input#company_name').focus();
        setAccountDefaults(firstCall); // use account defaults as adding a new company
      }
    }
  }

  function storeAccountDefaults() {
    $('input#backlog_rate').data('default', $('input#backlog_rate').val())
    $('input#backlog_velocity').data('default', $('input#backlog_velocity').val())
    $('input#backlog_use_50_90').data('default', $('input#backlog_use_50_90').attr('checked'));
  }

  function setAccountDefaults(firstCall) {
    // don't change defaults if backlog already exists
    if (!isEditingBacklog()) {
      $('input#backlog_rate').val($('input#backlog_rate').data('default'));
      $('input#backlog_velocity').val($('input#backlog_velocity').data('default'));
      $('input#backlog_use_50_90').attr('checked', $('input#backlog_use_50_90').data('default'));
      // show cost estimate options if previously used for this company
      if (!firstCall) { resetEstimatableVisibility(); }
    }
  }

  function getCompanyDefaults(firstCall) {
    // don't change defaults if backlog already exists
    if (!isEditingBacklog()) {
      var selected = $('select#backlog_company_id option:selected').val();
      var account_ID = document.location.href.match(/\/accounts\/(\d+)\//i);
      $.getJSON('/accounts/' + account_ID[1] + '/companies/' + selected + '.json', {}, function(data) {
        $('input#backlog_rate').val(data.default_rate);
        $('input#backlog_velocity').val(data.default_velocity);
        $('input#backlog_use_50_90').attr('checked', data.default_use_50_90);
        // show cost estimate options if previously used for this company
        if (!firstCall) { resetEstimatableVisibility(); }
      });
    }
  }

  function resetEstimatableVisibility() {
    if ($('input#backlog_velocity').val()) {
      $('input#backlog_days_estimatable_true').attr('checked', true);
    } else {
      $('input#backlog_days_estimatable_false').attr('checked', true);
    }
    setDaysEstimatableVisibility();
  }

  function isEditingBacklog() {
    return $('form.edit_backlog').length > 0;
  }

  return {
    initializeManageBacklog: initializeManageBacklog
  }
})();