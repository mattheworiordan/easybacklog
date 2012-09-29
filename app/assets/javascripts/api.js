//= require jquery
//= require vendor_all/underscore
//= require conditional/syntax-highlighter/shCore
//= require conditional/syntax-highlighter/shBrushJScript
//= require conditional/syntax-highlighter/shBrushXml

$(function() {
  SyntaxHighlighter.defaults['gutter'] = false;
  SyntaxHighlighter.all();
});

// enable feedback button
setTimeout(function() {
  $('a.feedback-button').mouseover(function() {
    if (typeof UE !== 'undefined') {
      UE.Popin.preload();
    }
  }).click(function(event) {
    event.preventDefault();
    if (typeof UE !== 'undefined') {
      UE.Popin.show();
    } else {
      document.location.href = '/contact';
    }
  }).fadeIn();
}, 1500);