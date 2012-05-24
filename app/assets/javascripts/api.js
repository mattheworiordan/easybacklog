//= require jquery
//= require vendor_all/underscore
//= require conditional/syntax-highlighter/shCore
//= require conditional/syntax-highlighter/shBrushJScript
//= require conditional/syntax-highlighter/shBrushXml

$(function() {
  SyntaxHighlighter.defaults['gutter'] = false;
  SyntaxHighlighter.all();
});