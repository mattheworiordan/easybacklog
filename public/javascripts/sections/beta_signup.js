/*global $,document,jQuery */
$(document).ready(function () {
  var visibleCriteriaCard, lightBoxOptions, featureNavs, animatingCards;

  // validate method for apply form
  function validateEmail (required) {
    var valid = false;

    if ($(this).val().match(/^\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}\b$/i)) {
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
  $('input#beta_signup_email').blur(function () { validateEmail.call(this); });
  $('form').submit(function () {
    if (!validateEmail.call($('input#beta_signup_email')[0], true)) {
      $('.error-message .container').animate({
        backgroundColor: '#FFFF00'
      }, 500, function () {
        $(this).animate({
          backgroundColor: '#FAFAFA'
        }, function () {
          $(this).css('background-color', 'transparent');
        });
      });
      return false;
    } else {
      $('.request-access input[type=submit]').addClass('disabled');
      $('.request-access input[type=submit]').attr('disabled', true);
      $('.request-access .progress').show();
      return true;
    }
  });

  featureNavs = $('.feature-nav ul li');
  animatingCards = false;

  // show's relevant card based on selected feature nav
  function showCard (moveForward) {
    var selectedIndex, visibleCard, visibleStoryCard;
    featureNavs.each(function (index, elem) {
      if ($(elem).hasClass('selected')) {
        selectedIndex = index + 1;
      }
    });

    // move forward one card
    if (moveForward) {
      featureNavs.removeClass('selected');
      if (selectedIndex < featureNavs.length) {
        selectedIndex += 1;
      } else {
        selectedIndex = 1;
      }
      $('.feature-nav ul li:nth-child(' + selectedIndex + ')').addClass('selected');
    }

    // make card + 2 (2 other child elements of .dual-cards exist) visible
    visibleCard = $('.dual-cards .card.visible').css('z-index', 10);
    visibleStoryCard = visibleCard.find('.story-card');
    visibleCriteriaCard = visibleCard.find('.criteria-card');

    animatingCards = true;

    $('.dual-cards .card:nth-child(' + (selectedIndex+2) + ')').addClass('visible').css('z-index', 5);

    visibleStoryCard.animate({
      left: '-=330',
      top: '-=60'
    }, 300, 'easeInCubic', function () {
      visibleCard.css('z-index', 1);
      visibleStoryCard.animate({
        left: '+=330',
        top: '+=60'
      }, 300, 'easeOutCubic', function () {
        visibleCard.removeClass('visible');
        animatingCards = false;
      });
    });
    visibleCriteriaCard.animate({
      left: '+=330',
      top: '+=60'
    }, 300, 'easeInCubic', function () {
      visibleCriteriaCard.animate({
        left: '-=330',
        top: '-=60'
      }, 300, 'easeOutCubic');
    });
  }

  // set class on clicked nav li
  featureNavs.click(function () {
    if (!animatingCards) {
      if (!$(this).hasClass('selected')) {
        featureNavs.removeClass('selected');
        $(this).addClass('selected');
        showCard();
      }
    }
  }).disableSelection();

  // if a card is clicked, move to the next one
  $('.dual-cards .card').click(function () {
    if (!animatingCards) { showCard(true); }
  }).disableSelection();

  // if user clicks on request invitation then put the focus on the email field
  $('a#request-invitation-footer').click(function () {
    $('#beta_signup_email').focus();
  });

  // lightbox relevant media items
  lightBoxOptions = { imageBtnPrev: '/images/beta_signup/lightbox-prev.png', imageBtnNext: '/images/beta_signup/lightbox-next.png' };
  $('.content-mix a.light-box').lightBox(lightBoxOptions);
  $('.features a.light-box').lightBox(lightBoxOptions);
  $('a.light-box-group, .screen-shots a').lightBox($.extend(lightBoxOptions, {fixedNavigation:true}));
});

jQuery.fn.inputLabelize = function () {
  this.focus(function () {
    var firstClick = false, faded, offset, that;
    if (!$(this).data('original-value')) {
      firstClick = true;
      $(this).data('original-value', $(this).val());
    }
    faded = $('<div id="' + $(this).attr('id') + '_faded" class="faded-request-access">');
    faded.text($(this).data('original-value'));
    faded.css('position', 'absolute');
    faded.css('width', $(this).width() + 'px');
    faded.css('height', $(this).height() + 'px');
    that = this;
    offset = '1 -3'; // default;
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
    }).click(function () {
      $(that).focus();
    });
    if ( (!this.firstClick) && ($(this).data('original-value') !== $(this).val()) ) {
      faded.hide();
    } else {
      $(this).val('');
    }
    setTimeout(function() {
      $('section.content').append(faded);
    }, 0);
    $(this).addClass('enabled');
  }).keyup(function () {
    if ($(this).val() === '') {
      $('.faded-request-access').show();
    } else {
      $('.faded-request-access').hide();
    }
  }).blur(function () {
    if ($(this).val().replace(/\s+/) === '') {
      $(this).val($(this).data('original-value'));
      $(this).removeClass('enabled');
    }
    $('.faded-request-access').remove();
  });
};