$(document).ready(function() {
  $('input[type=text]').inputLabelize();
})

jQuery.fn.inputLabelize = function() {
  this.focus(function() {
    var firstClick = false;
    if (!$(this).data('original-value')) {
      firstClick = true;
      $(this).data('original-value', $(this).val());
    }
    var faded = $('<div id="' + $(this).attr('id') + '_faded" class="faded">');
    faded.text($(this).data('original-value'));
    faded.css('position', 'absolute');
    faded.css('width', $(this).width() + 'px');
    faded.css('height', $(this).height() + 'px');
    var that = this;
    faded.position({
      my: 'top left',
      at: 'top left',
      of: $(this),
      offset: $.browser.webkit ? '1 -3' : '1 -4'
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
      $('.faded').show();
    } else {
      $('.faded').hide();
    }
  }).blur(function() {
    if ($(this).val().replace(/\s+/) == '') {
      $(this).val($(this).data('original-value'));
      $(this).removeClass('enabled');
    }
    $('.faded').remove();
  });
}