/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

App.Views.BacklogCreateUpdateMethods = (function() {
  function initializeManageBacklog() {
    var excludeThisBacklog = '';
    if (isEditingBacklog()) {
      excludeThisBacklog = '?exclude=' + document.location.href.match(/\/backlogs\/(\d+)\//i)[1];
    }
    // standard user rules
    var rules = {
      'backlog[name]': {
        required: true
      },
      'backlog[rate]': {
        required: true,
        number: true,
        min: 0
      },
      'backlog[velocity]': {
        required: true,
        number: true,
        min: 0.1
      }
    };

    // validate signup form on keyup and submit
    $("form#new_backlog, form.edit_backlog").validate({
      rules: rules,
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

    // store initial account defaults
    storeAccountDefaults();
    // hide / show the company selection depending on state
    setCompanyVisibility();
    // highlight the label when the check boxes are selected
    $('input#backlog_has_company_false, input#backlog_has_company_true').change(function() {
      setCompanyVisibility();
    })
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
    // update company defaults when selecting a company
    $('select#backlog_company_id').change(getCompanyDefaults);

    // if this page is in a non-editable state, then trim the page down and disable all input elements
    if ($('.not-editable-notice').length) {
      $('input[type=text],input[type=checkbox],input[name="backlog[scoring_rule_id]"],select').attr('disabled', true);
      $('#backlog_has_company_false, #backlog_has_company_true').attr('disabled', true);
      $('.client-select .new-company').hide();
    }
  };

  function setCompanyVisibility() {
    if ($('input#backlog_has_company_false').is(':checked')) {
      $('.client-select, .client-select .existing, .client-select .new').hide();
      $('#has_company_false_label').addClass('selected');
      $('#has_company_true_label').removeClass('selected');
      setAccountDefaults(); // use account defaults as not using a company
    } else {
      $('#has_company_true_label').addClass('selected');
      $('#has_company_false_label').removeClass('selected');
      $('.client-select').show();
      if ($('#backlog_company_id option').length > 0) {
        // existing companies exist so let user choose a company as first option
        $('.client-select .existing').css('height','auto').slideDown(); // strange bug when redisplaying this tab height is set to 1px
        $('select#backlog_company_id').focus();
        getCompanyDefaults();
      } else {
        // no companies, force user to enter a new company name
        $('.client-select .new').css('height','auto').slideDown(); // strange bug when redisplaying this tab height is set to 1px
        $('.client-select .existing').hide();
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

  return {
    initializeManageBacklog: initializeManageBacklog
  }
})();