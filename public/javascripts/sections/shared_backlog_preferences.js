App.Views.Shared = {
  /* Adds front end logic to the estimation fields of backlog settings that can also apply to a company or account as defaults */
  EnableBacklogEstimationPreferences: function(frm, namespace) {
    var defaultPrefix = (namespace == 'backlog' ? '' : '_default'), // for account and company all fields are prefixed with default_
        haveSuggestedEstimates = false,
        setDaysEstimatableVisibility = function() {
      if ( $('input#' + namespace + '_days_estimatable_false').is(':checked') ) {
        // hide rate & velocity, disable estimates
        // store rate & velocity in case we need to restore them
        frm.find('#' + namespace + defaultPrefix + '_velocity').rules('add', { required: false }); // velocity is not required
        frm.find('input#velocity_was').val(frm.find('input#' + namespace + defaultPrefix + '_velocity').val());
        frm.find('input#rate_was').val(frm.find('input#' + namespace + defaultPrefix + '_rate').val());
        frm.find('input#' + namespace + defaultPrefix + '_velocity, input#' + namespace + defaultPrefix + '_rate').val('');
        frm.find('.cost-elements').hide();
        frm.find('#days_estimatable_false_label').addClass('selected');
        frm.find('#days_estimatable_true_label').removeClass('selected');
      } else {
        // show rate & velocity, enable estimates
        // get rate & velocity from previous value set if exists
        frm.find('input#' + namespace + defaultPrefix + '_velocity').rules('add', { required: true }); // velocity is now required
        // restore velocity if one existed before
        if (frm.find('input#velocity_was').val()) {
          frm.find('input#' + namespace + defaultPrefix + '_velocity').val(frm.find('input#velocity_was').val());
        }
        // restore rate if one existed before
        if (frm.find('input#rate_was').val()) {
          frm.find('input#' + namespace + defaultPrefix + '_rate').val(frm.find('input#rate_was').val());
        }
        frm.find('#days_estimatable_true_label').addClass('selected');
        frm.find('#days_estimatable_false_label').removeClass('selected');
        frm.find('.cost-elements').slideDown();
      }
    };

    // although no estimates is selected, this is based on a brand new account, so lets ensure we enable estimates even if the velocity is blank
    if (!haveSuggestedEstimates && frm.find('input#' + namespace + '_days_estimatable_false').is(':checked')) {
      if (_.include(['','false','f'], frm.find('input#account_defaults_set').val())) {
        $('input#' + namespace + '_days_estimatable_true').attr('checked', true);
        haveSuggestedEstimates = true;
      }
    }

    setDaysEstimatableVisibility();
    $('input#' + namespace + '_days_estimatable_false, input#' + namespace + '_days_estimatable_true').change(function() { setDaysEstimatableVisibility() });

    return setDaysEstimatableVisibility;
  }
};