/*global Backbone:false, $:false, _:false, JST:false, App:false, window:false */

$(document).ready(function(event) {
  // Excel doesn't recognise background colors so we set foreground & background to orange
  // and reinstate foreground with JavaScript
  // Excel then uses the foreground color and ignores the background color
  $('.changed').css('color','black');

  // add the tools for browser only
  $('tr.header').html(JST['templates/snapshots/snapshot-header']({ columns: $('tr.header td:first-child').attr('colspan') }));

  $('a#close-window').click(function(event) {
    event.preventDefault();
    window.close();
  });

  $('a#print').click(function(event) {
    event.preventDefault();
    window.print();
  });

  $('a#help').click(function(event) {
    event.preventDefault();
  });
});