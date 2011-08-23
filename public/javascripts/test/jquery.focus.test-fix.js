/**
 * JQuery tries to use native CSS selectors instead of the Sizzle selector
 * engine for performance reasons.
 *
 * This causes problems when trying to test intefaces using the
 * :focus pseudo selector as unless the web page and browser window
 * has the focus, all elements are considered to be without focus.
 * Checking for :focus in Selenium or Capybara tests therefore fail if
 * using JQuery or Sizzle.
 *
 * Sizzle will however return true for a :focus element even if the
 * window itself has lost focus if we force it not use the native selector functions
 * This script forces Sizzle to use its own engine over native selectors.
 *
 * This file MUST be included before JQuery or Sizzle is loaded
 *
 * Refer to http://blog.mattheworiordan.com/post/9308775285 for more info
 *
 **/

/* Prevent use of native find selector */
document.querySelectorAll = false;

/* Prevent use of native matches selector */
document.documentElement.matchesSelector = false;
document.documentElement.mozMatchesSelector = false;
document.documentElement.webkitMatchesSelector = false;
document.documentElement.msMatchesSelector = false;