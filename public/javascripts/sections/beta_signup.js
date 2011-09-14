$(document).ready(function() {
  // validate method for apply form
  var validateEmail = function(required) {
    var valid = false;

    if ($(this).val().match(/^([^\s]+)((?:[-a-z0-9]\.)[a-z]{2,})$/i)) {
      valid = true;
    } else {
      if (!$(this).data('original-value') || ($(this).data('original-value') === $(this).val())) {
        if (!required) {
          valid = true;
        }
      }
    }

    if (valid) {
      $(this).removeClass('invalid');
      $('.error-message .container').html('');
    } else {
      $(this).addClass('invalid');
      $('.error-message .container').html("Oops, that's not a valid email.<br/>Please try again.");
    }
    return valid;
  }

  // labellize the form elements (i.e. label is embedded within the element)
  $('input[type=text]').inputLabelize();
  $('input#beta_signup_email').blur(function() { validateEmail.call(this); });
  $('form').submit(function() {
    if (!validateEmail.call($('input#beta_signup_email')[0], true)) {
      $('.error-message .container').animate({
        backgroundColor: '#FFFF00'
      }, 500, function() {
        $(this).animate({
          backgroundColor: '#FAFAFA'
        }, function() {
          $(this).css('background-color', 'transparent');
        });
      });
      return false;
    }
    return true;
  });

  var featureNavs = $('.feature-nav ul li');
  var animatingCards = false;

  // show's relevant card based on selected feature nav
  var showCard = function(moveForward) {
    var selectedIndex;
    featureNavs.each(function(index, elem) {
      if ($(elem).hasClass('selected')) {
        selectedIndex = index + 1;
      }
    });

    // move forward one card
    if (moveForward) {
      featureNavs.removeClass('selected');
      if (selectedIndex < featureNavs.length) {
        selectedIndex++;
      } else {
        selectedIndex = 1;
      }
      $('.feature-nav ul li:nth-child(' + selectedIndex + ')').addClass('selected');
    }

    // make card + 2 (2 other child elements of .dual-cards exist) visible
    var visibleCard = $('.dual-cards .card.visible').css('z-index', 10);
    var visibleStoryCard = visibleCard.find('.story-card');
    var visibleCriteriaCard = visibleCard.find('.criteria-card');

    animatingCards = true;

    $('.dual-cards .card:nth-child(' + (selectedIndex+2) + ')').addClass('visible').css('z-index', 5);

    visibleStoryCard.animate({
      left: '-=330',
      top: '-=60'
    }, 300, 'easeInCubic', function() {
      visibleCard.css('z-index', 1);
      visibleStoryCard.animate({
        left: '+=330',
        top: '+=60'
      }, 300, 'easeOutCubic', function() {
        visibleCard.removeClass('visible');
        animatingCards = false;
      });
    });
    visibleCriteriaCard.animate({
      left: '+=330',
      top: '+=60'
    }, 300, 'easeInCubic', function() {
      visibleCriteriaCard.animate({
        left: '-=330',
        top: '-=60'
      }, 300, 'easeOutCubic');
    });
  };

  // set class on clicked nav li
  featureNavs.click(function(event) {
    if (!animatingCards) {
      if (!$(this).hasClass('selected')) {
        featureNavs.removeClass('selected');
        $(this).addClass('selected');
        showCard();
      }
    }
  }).disableSelection();

  // if a card is clicked, move to the next one
  $('.dual-cards .card').click(function(event) {
    if (!animatingCards) { showCard(true); }
  }).disableSelection();

  // if user clicks on request invitation then put the focus on the email field
  $('a#request-invitation-footer').click(function(event) {
    $('#beta_signup_email').focus();
  })

  // lightbox relevant media items
  $('a.light-box').lightBox();
  $('a.light-box-group, .screen-shots a').lightBox({fixedNavigation:true});
});

jQuery.fn.inputLabelize = function() {
  this.focus(function() {
    var firstClick = false;
    if (!$(this).data('original-value')) {
      firstClick = true;
      $(this).data('original-value', $(this).val());
    }
    var faded = $('<div id="' + $(this).attr('id') + '_faded" class="faded-request-access">');
    faded.text($(this).data('original-value'));
    faded.css('position', 'absolute');
    faded.css('width', $(this).width() + 'px');
    faded.css('height', $(this).height() + 'px');
    var that = this;
    var offset = '1 -3'; // default;
    if ($.browser.mozilla) {
      if ($.browser.versionInt >= 5) {
        offset = '0 -2';
      } else {
        offset = '1 -2';
      }
    } else if ($.browser.msie) {
      offset = '-1 -2';
    }
    faded.position({
      my: 'top left',
      at: 'top left',
      of: $(this),
      offset: offset
    }).click(function() {
      $(that).focus();
    });
    if ( (!this.firstClick) && ($(this).data('original-value') != $(this).val()) ) {
      faded.hide();
    } else {
      $(this).val('');
    }
    $('section.content').append(faded);
    $(this).addClass('enabled');
  }).keyup(function(evt) {
    if ($(this).val() == '') {
      $('.faded-request-access').show();
    } else {
      $('.faded-request-access').hide();
    }
  }).blur(function() {
    if ($(this).val().replace(/\s+/) == '') {
      $(this).val($(this).data('original-value'));
      $(this).removeClass('enabled');
    }
    $('.faded-request-access').remove();
  });
}