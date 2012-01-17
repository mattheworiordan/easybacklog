App.Views.SharedSprintSettings = {
  /*
   * Sprint settings shared between the new sprint dialog and sprint settings page
   */

  formValidationConfig: {
    rules: {
     start_on: {
       required: true
     },
     duration_days: {
       required: true,
       digits: true,
       min: 1
     },
     number_team_members: {
       number: true,
       min: 0
     },
     explicit_velocity: {
       number: true,
       min: 1
     }
    },
    messages: {
     start_on: {
       required: 'Date&nbsp;missing'
     },
     duration_days: {
       required: 'Sprint duration is required',
       digits: 'Enter a value using whole numbers',
       min: 'Sprint duration must be at least 1 day'
     },
     number_team_members: {
       required: 'Team size is required',
       min: 'Team size must be greater than 0',
       number: 'Team size must be a valid number'
     },
     explicit_velocity: {
       required: 'Velocity is required',
       number: 'Velocity must be a valid number',
       min: 'Velocity must be at least 1'
     }
    }
  },

  addFormBehaviour: function(target, backlogVelocity) {
    var firstRun = false,
        velocityCalculationMethodChanged = function() {
      // clear any previous layout settings
      target.find('tr').removeClass('disabled').find('input').removeAttr('disabled');
      target.find('#explicit-velocity, #number-team-members').rules('add', { required: false });

      if (target.find('#use-team-members').is(':checked')) {
        // using team members for calculations
        target.find('tr.use-explicit-velocity').addClass('disabled').find('input').attr('disabled','true'); // disable if in dialog mode
        if (firstRun) {
          target.find('#use-explicit-velocity-container').slideUp();
        } else {
          target.find('#use-explicit-velocity-container').hide();
          firstRun = true;
        }
        target.find('#use-team-members-container').slideDown();
        target.find('#number-team-members').rules('add', { required: true });
        target.find('label#use-explicit-velocity-false').addClass('selected');
        target.find('label#use-explicit-velocity-true').removeClass('selected');
      } else {
        // using explicity velocity for velocity
        target.find('tr.use-team-members').addClass('disabled').find('input').attr('disabled','true');
        target.find('#explicit-velocity').rules('add', { required: true });
        if (firstRun) {
          target.find('#use-team-members-container').slideUp();
        } else {
          target.find('#use-team-members-container').hide();
          firstRun = true;
        }
        target.find('#use-explicit-velocity-container').slideDown();
        target.find('label#use-explicit-velocity-true').addClass('selected');
        target.find('label#use-explicit-velocity-false').removeClass('selected');
      }
    },  teamSizeChanged = function() {
      var expectedVelocity;
      if (isNaN(parseFloat(target.find('#number-team-members').val()))) {
        target.find('#expected-velocity').text('(enter your team size)');
      } else if (isNaN(parseFloat(target.find('#duration-days').val()))) {
        target.find('#expected-velocity').text('(enter duration of sprint)');
      } else {
        // valid number team members and duration entered
        expectedVelocity = parseFloat(target.find('#number-team-members').val()) * parseFloat(target.find('#duration-days').val()) * backlogVelocity;
        target.find('#expected-velocity').text(expectedVelocity === 1 ? niceNum(expectedVelocity) + ' point' : niceNum(expectedVelocity) + ' points');
      }
    }

    // set default position to calculated if we have a backlog velocity
    if (backlogVelocity && !target.find('#explicit-velocity').val()) {
      target.find('#use-team-members').attr('checked', true);
    } else {
      target.find('#use-explicit-velocity').attr('checked', true);
    }

    // assign event handlers and trigger events
    target.find('#use-team-members, #use-explicit-velocity').change(velocityCalculationMethodChanged);
    velocityCalculationMethodChanged();
    target.find('#duration-days, #number-team-members').keyup(teamSizeChanged);
    teamSizeChanged();
  }
}